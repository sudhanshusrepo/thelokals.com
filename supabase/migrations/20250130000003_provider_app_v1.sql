-- Migration: Provider App v1.0 Schema
-- Description: Add registration status, notifications, and pin features for provider app
-- Phase: Provider App v1.0
-- Idempotent: Safe to re-run

-- ============================================================================
-- 1. UPDATE PROVIDERS TABLE WITH REGISTRATION STATUS
-- ============================================================================

-- Add registration status and verification columns
ALTER TABLE public.providers 
ADD COLUMN IF NOT EXISTS registration_status TEXT DEFAULT 'unregistered' 
CHECK (registration_status IN ('unregistered', 'pending', 'verified', 'rejected'));

ALTER TABLE public.providers 
ADD COLUMN IF NOT EXISTS registration_completed_at TIMESTAMPTZ;

ALTER TABLE public.providers 
ADD COLUMN IF NOT EXISTS digilocker_verified BOOLEAN DEFAULT false;

ALTER TABLE public.providers 
ADD COLUMN IF NOT EXISTS profile_photo_verified BOOLEAN DEFAULT false;

ALTER TABLE public.providers 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create index for quick lookup
CREATE INDEX IF NOT EXISTS idx_providers_registration_status 
ON public.providers(registration_status);

-- Update existing providers to 'verified' status (backward compatibility)
UPDATE public.providers 
SET registration_status = 'verified',
    registration_completed_at = created_at,
    digilocker_verified = true,
    profile_photo_verified = true
WHERE registration_status = 'unregistered';

-- ============================================================================
-- 2. PROVIDER NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.provider_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('booking_request', 'booking_update', 'payment', 'system', 'promotion')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_provider_notifications_provider_id 
ON public.provider_notifications(provider_id);

CREATE INDEX IF NOT EXISTS idx_provider_notifications_read 
ON public.provider_notifications(provider_id, read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_provider_notifications_type 
ON public.provider_notifications(provider_id, type, created_at DESC);

-- ============================================================================
-- 3. PROVIDER PINS/FAVORITES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.provider_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  pinned_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  -- Ensure either booking or client is pinned, not both
  CONSTRAINT check_pin_target CHECK (
    (booking_id IS NOT NULL AND client_id IS NULL) OR
    (booking_id IS NULL AND client_id IS NOT NULL)
  )
);

-- Unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_provider_pins_booking 
ON public.provider_pins(provider_id, booking_id) 
WHERE booking_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_provider_pins_client 
ON public.provider_pins(provider_id, client_id) 
WHERE client_id IS NOT NULL;

-- Regular indexes
CREATE INDEX IF NOT EXISTS idx_provider_pins_provider_id 
ON public.provider_pins(provider_id, pinned_at DESC);

-- ============================================================================
-- 4. PROVIDER PUSH NOTIFICATION TOKENS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.provider_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  push_token TEXT NOT NULL,
  device_id TEXT,
  platform TEXT CHECK (platform IN ('ios', 'android', 'web')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(provider_id, push_token)
);

CREATE INDEX IF NOT EXISTS idx_provider_push_tokens_provider_id 
ON public.provider_push_tokens(provider_id);

-- ============================================================================
-- 5. FUNCTIONS
-- ============================================================================

-- Function to check if provider can accept bookings
CREATE OR REPLACE FUNCTION can_accept_bookings(provider_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.providers
    WHERE id = provider_uuid
    AND registration_status = 'verified'
    AND is_available = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification for provider
CREATE OR REPLACE FUNCTION create_provider_notification(
  p_provider_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}'::jsonb,
  p_action_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.provider_notifications (
    provider_id,
    type,
    title,
    message,
    data,
    action_url
  ) VALUES (
    p_provider_id,
    p_type,
    p_title,
    p_message,
    p_data,
    p_action_url
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.provider_notifications
  SET read = true,
      read_at = now()
  WHERE id = notification_id
  AND provider_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(provider_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.provider_notifications
    WHERE provider_id = provider_uuid
    AND read = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. TRIGGERS
-- ============================================================================

-- Trigger to create notification when new booking request is created
CREATE OR REPLACE FUNCTION notify_provider_new_booking_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification if provider is assigned
  IF NEW.provider_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Create notification for provider
  PERFORM create_provider_notification(
    NEW.provider_id,
    'booking_request',
    'New Booking Request',
    'You have a new booking request from ' || (
      SELECT full_name FROM public.profiles WHERE id = NEW.client_id
    ),
    jsonb_build_object(
      'booking_id', NEW.id,
      'client_id', NEW.client_id,
      'service_category', NEW.service_category
    ),
    '/bookings/' || NEW.id::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_provider_new_booking ON public.bookings;
CREATE TRIGGER trigger_notify_provider_new_booking
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  WHEN (NEW.status = 'PENDING' AND NEW.provider_id IS NOT NULL)
  EXECUTE FUNCTION notify_provider_new_booking_request();

-- Trigger to create notification when booking status changes
CREATE OR REPLACE FUNCTION notify_provider_booking_update()
RETURNS TRIGGER AS $$
DECLARE
  status_message TEXT;
BEGIN
  -- Only notify on status changes
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  -- Only create notification if provider is assigned
  IF NEW.provider_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Create appropriate message based on status
  status_message := CASE NEW.status
    WHEN 'CONFIRMED' THEN 'Booking confirmed'
    WHEN 'IN_PROGRESS' THEN 'Booking started'
    WHEN 'COMPLETED' THEN 'Booking completed'
    WHEN 'CANCELLED' THEN 'Booking cancelled'
    ELSE 'Booking status updated'
  END;
  
  -- Create notification for provider
  PERFORM create_provider_notification(
    NEW.provider_id,
    'booking_update',
    'Booking Update',
    status_message || ' - Booking #' || SUBSTRING(NEW.id::text, 1, 8),
    jsonb_build_object(
      'booking_id', NEW.id,
      'old_status', OLD.status,
      'new_status', NEW.status
    ),
    '/bookings/' || NEW.id::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_provider_booking_update ON public.bookings;
CREATE TRIGGER trigger_notify_provider_booking_update
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.provider_id IS NOT NULL)
  EXECUTE FUNCTION notify_provider_booking_update();

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE public.provider_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_push_tokens ENABLE ROW LEVEL SECURITY;

-- Provider Notifications Policies
CREATE POLICY "Providers can view their own notifications"
  ON public.provider_notifications
  FOR SELECT
  TO authenticated
  USING (provider_id = auth.uid());

CREATE POLICY "Providers can update their own notifications"
  ON public.provider_notifications
  FOR UPDATE
  TO authenticated
  USING (provider_id = auth.uid())
  WITH CHECK (provider_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON public.provider_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Provider Pins Policies
CREATE POLICY "Providers can view their own pins"
  ON public.provider_pins
  FOR SELECT
  TO authenticated
  USING (provider_id = auth.uid());

CREATE POLICY "Providers can create their own pins"
  ON public.provider_pins
  FOR INSERT
  TO authenticated
  WITH CHECK (provider_id = auth.uid());

CREATE POLICY "Providers can update their own pins"
  ON public.provider_pins
  FOR UPDATE
  TO authenticated
  USING (provider_id = auth.uid())
  WITH CHECK (provider_id = auth.uid());

CREATE POLICY "Providers can delete their own pins"
  ON public.provider_pins
  FOR DELETE
  TO authenticated
  USING (provider_id = auth.uid());

-- Provider Push Tokens Policies
CREATE POLICY "Providers can view their own push tokens"
  ON public.provider_push_tokens
  FOR SELECT
  TO authenticated
  USING (provider_id = auth.uid());

CREATE POLICY "Providers can manage their own push tokens"
  ON public.provider_push_tokens
  FOR ALL
  TO authenticated
  USING (provider_id = auth.uid())
  WITH CHECK (provider_id = auth.uid());

-- ============================================================================
-- 8. GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON public.provider_notifications TO authenticated;
GRANT ALL ON public.provider_pins TO authenticated;
GRANT ALL ON public.provider_push_tokens TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION can_accept_bookings(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_provider_notification(UUID, TEXT, TEXT, TEXT, JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notification_count(UUID) TO authenticated;

-- ============================================================================
-- 9. REALTIME SETUP
-- ============================================================================

-- Enable realtime for provider notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.provider_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.provider_pins;
