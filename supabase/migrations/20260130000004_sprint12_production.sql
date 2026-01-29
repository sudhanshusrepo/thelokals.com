-- Sprint 12: Production Readiness & Optimization (Simplified)
-- Performance indexes, security hardening, and production optimizations

BEGIN;

-- PERFORMANCE INDEXES (without ANALYZE to avoid partition issues)
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_provider_status ON bookings(provider_id, status) WHERE provider_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_created_status ON bookings(created_at DESC, status);

CREATE INDEX IF NOT EXISTS idx_booking_requests_provider_status ON booking_requests(provider_id, status);
CREATE INDEX IF NOT EXISTS idx_booking_requests_booking ON booking_requests(booking_id, status);

CREATE INDEX IF NOT EXISTS idx_providers_active_online ON providers(is_active, is_online) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_providers_category ON providers(category_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_providers_rating ON providers(rating DESC) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_reviews_provider ON reviews(provider_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id, created_at DESC);

-- MONITORING FUNCTIONS
CREATE OR REPLACE FUNCTION get_database_health()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_total_bookings BIGINT;
  v_active_bookings BIGINT;
  v_total_providers BIGINT;
  v_online_providers BIGINT;
BEGIN
  SELECT COUNT(*) INTO v_total_bookings FROM bookings;
  SELECT COUNT(*) INTO v_active_bookings FROM bookings WHERE status IN ('PENDING', 'CONFIRMED', 'EN_ROUTE', 'IN_PROGRESS');
  SELECT COUNT(*) INTO v_total_providers FROM providers WHERE is_active = true;
  SELECT COUNT(*) INTO v_online_providers FROM providers WHERE is_active = true AND is_online = true;
  
  v_result := jsonb_build_object(
    'timestamp', NOW(),
    'bookings', jsonb_build_object(
      'total', v_total_bookings,
      'active', v_active_bookings
    ),
    'providers', jsonb_build_object(
      'total', v_total_providers,
      'online', v_online_providers
    )
  );
  
  RETURN v_result;
END;
$$;

-- RATE LIMITING
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_user ON rate_limits(user_id, window_start DESC);

-- AUDIT LOGGING
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action, created_at DESC);

-- DATA RETENTION
CREATE OR REPLACE FUNCTION cleanup_old_notifications(p_days_old INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM notifications
  WHERE read = true
    AND created_at < NOW() - (p_days_old || ' days')::INTERVAL;
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

COMMIT;
