-- Sprint 11: Notifications & Communication
-- Implements notification system with FCM support, preferences, and in-app messaging

BEGIN;

-- ============================================
-- NOTIFICATION TOKENS
-- ============================================

-- Store FCM tokens for push notifications
CREATE TABLE IF NOT EXISTS notification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('web', 'ios', 'android')),
  device_info JSONB DEFAULT '{}'::JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  UNIQUE(user_id, token)
);

CREATE INDEX IF NOT EXISTS idx_notification_tokens_user ON notification_tokens(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_notification_tokens_platform ON notification_tokens(platform) WHERE is_active = true;

-- ============================================
-- NOTIFICATION PREFERENCES
-- ============================================

-- User notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Push notification toggles
  push_enabled BOOLEAN DEFAULT true,
  new_job_request BOOLEAN DEFAULT true,
  job_accepted BOOLEAN DEFAULT true,
  provider_en_route BOOLEAN DEFAULT true,
  job_started BOOLEAN DEFAULT true,
  job_completed BOOLEAN DEFAULT true,
  payment_received BOOLEAN DEFAULT true,
  payment_required BOOLEAN DEFAULT true,
  new_review BOOLEAN DEFAULT true,
  job_cancelled BOOLEAN DEFAULT true,
  
  -- Email notification toggles
  email_enabled BOOLEAN DEFAULT true,
  email_booking_summary BOOLEAN DEFAULT true,
  email_weekly_summary BOOLEAN DEFAULT false,
  email_promotional BOOLEAN DEFAULT false,
  
  -- SMS toggles
  sms_enabled BOOLEAN DEFAULT false,
  sms_critical_only BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id);

-- Auto-create preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_create_notification_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();

-- ============================================
-- NOTIFICATION HISTORY
-- ============================================

-- Track all sent notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}'::JSONB,
  
  -- Delivery tracking
  sent_via TEXT[] DEFAULT ARRAY[]::TEXT[], -- ['push', 'email', 'sms']
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Related entities (no FK constraint due to partitioned table)
  booking_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_booking ON notifications(booking_id) WHERE booking_id IS NOT NULL;

-- ============================================
-- IN-APP MESSAGES
-- ============================================

-- Chat/messaging between client and provider
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'location', 'system')),
  metadata JSONB DEFAULT '{}'::JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_messages_booking ON messages(booking_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id) WHERE read_at IS NULL;

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE notification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Notification Tokens: Users manage their own tokens
CREATE POLICY notification_tokens_policy ON notification_tokens
  FOR ALL USING (auth.uid() = user_id);

-- Notification Preferences: Users manage their own preferences
CREATE POLICY notification_preferences_policy ON notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Notifications: Users view their own notifications
CREATE POLICY notifications_select_policy ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY notifications_update_policy ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Messages: Users can view messages in their bookings
CREATE POLICY messages_select_policy ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

CREATE POLICY messages_insert_policy ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM bookings
      WHERE id = booking_id
      AND (user_id = auth.uid() OR provider_id = auth.uid())
    )
  );

CREATE POLICY messages_update_policy ON messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- ============================================
-- NOTIFICATION FUNCTIONS
-- ============================================

-- Send notification (called by triggers or Edge Functions)
CREATE OR REPLACE FUNCTION send_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_body TEXT,
  p_data JSONB DEFAULT '{}'::JSONB,
  p_booking_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
  v_preferences RECORD;
  v_should_send BOOLEAN := false;
BEGIN
  -- Check user preferences
  SELECT * INTO v_preferences
  FROM notification_preferences
  WHERE user_id = p_user_id;
  
  -- If no preferences found, create defaults and allow notification
  IF NOT FOUND THEN
    INSERT INTO notification_preferences (user_id)
    VALUES (p_user_id)
    RETURNING * INTO v_preferences;
    v_should_send := true;
  ELSE
    -- Check if this notification type is enabled
    v_should_send := CASE p_type
      WHEN 'new_job_request' THEN v_preferences.new_job_request
      WHEN 'job_accepted' THEN v_preferences.job_accepted
      WHEN 'provider_en_route' THEN v_preferences.provider_en_route
      WHEN 'job_started' THEN v_preferences.job_started
      WHEN 'job_completed' THEN v_preferences.job_completed
      WHEN 'payment_received' THEN v_preferences.payment_received
      WHEN 'payment_required' THEN v_preferences.payment_required
      WHEN 'new_review' THEN v_preferences.new_review
      WHEN 'job_cancelled' THEN v_preferences.job_cancelled
      ELSE true -- Allow unknown types by default
    END;
  END IF;
  
  -- Only create notification if enabled
  IF v_should_send AND v_preferences.push_enabled THEN
    INSERT INTO notifications (user_id, type, title, body, data, booking_id)
    VALUES (p_user_id, p_type, p_title, p_body, p_data, p_booking_id)
    RETURNING id INTO v_notification_id;
    
    -- Edge Function will pick this up and send via FCM
    -- Trigger could also be added here to call Edge Function directly
    
    RETURN v_notification_id;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications
  SET read = true, read_at = NOW()
  WHERE id = p_notification_id
    AND user_id = auth.uid()
    AND read = false;
  
  RETURN FOUND;
END;
$$;

-- Mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications
  SET read = true, read_at = NOW()
  WHERE user_id = auth.uid()
    AND read = false;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM notifications
  WHERE user_id = auth.uid()
    AND read = false;
  
  RETURN v_count;
END;
$$;

COMMIT;
