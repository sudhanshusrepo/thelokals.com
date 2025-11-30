-- Migration: Realtime Setup
-- Description: Enable realtime subscriptions for live booking flow
-- Phase: 6 of 6
-- Idempotent: Safe to re-run

-- Drop existing view
DROP VIEW IF EXISTS provider_dashboard_stats;

-- Remove tables from realtime publication if they exist
DO $$
BEGIN
  -- Remove tables from publication (ignore errors if not present)
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.bookings;
  EXCEPTION
    WHEN OTHERS THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.live_booking_requests;
  EXCEPTION
    WHEN OTHERS THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.providers;
  EXCEPTION
    WHEN OTHERS THEN NULL;
  END;
END $$;

-- Enable realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_booking_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.providers;

-- Create a view for provider dashboard stats
CREATE VIEW provider_dashboard_stats AS
SELECT 
  p.id as provider_id,
  p.full_name,
  p.rating_average,
  p.total_jobs,
  p.total_earnings,
  COUNT(DISTINCT CASE WHEN b.status = 'PENDING' THEN b.id END) as pending_bookings,
  COUNT(DISTINCT CASE WHEN b.status = 'CONFIRMED' THEN b.id END) as confirmed_bookings,
  COUNT(DISTINCT CASE WHEN b.status = 'IN_PROGRESS' THEN b.id END) as active_bookings,
  COUNT(DISTINCT CASE WHEN b.status = 'COMPLETED' THEN b.id END) as completed_bookings,
  COUNT(DISTINCT lbr.id) FILTER (WHERE lbr.status = 'PENDING') as pending_requests
FROM public.providers p
LEFT JOIN public.bookings b ON b.provider_id = p.id
LEFT JOIN public.live_booking_requests lbr ON lbr.provider_id = p.id
GROUP BY p.id, p.full_name, p.rating_average, p.total_jobs, p.total_earnings;

-- Grant access to the view
GRANT SELECT ON provider_dashboard_stats TO authenticated;

-- Enable RLS on the view
ALTER VIEW provider_dashboard_stats SET (security_invoker = true);

-- Note: Clients should subscribe to these channels:
-- 1. Providers: live_booking_requests:provider_id=eq.{provider_id} for incoming requests
-- 2. Clients: bookings:client_id=eq.{client_id} for booking status updates
-- 3. Providers: bookings:provider_id=eq.{provider_id} for assigned bookings
