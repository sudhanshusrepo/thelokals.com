-- Sprint 10: Analytics & Insights
-- Provides analytics views and functions for providers, clients, and platform admins

BEGIN;

-- ============================================
-- PROVIDER ANALYTICS
-- ============================================

-- Provider Analytics Summary View
CREATE OR REPLACE VIEW provider_analytics AS
SELECT 
  p.id as provider_id,
  p.full_name as provider_name,
  p.rating as current_rating,
  p.review_count,
  COUNT(b.id) as total_jobs,
  COUNT(CASE WHEN b.status = 'COMPLETED' THEN 1 END) as completed_jobs,
  COUNT(CASE WHEN b.status = 'CANCELLED' THEN 1 END) as cancelled_jobs,
  COUNT(CASE WHEN b.status = 'IN_PROGRESS' THEN 1 END) as active_jobs,
  COALESCE(SUM(CASE WHEN b.payment_status = 'PAID' THEN b.provider_earnings END), 0) as total_earnings,
  COALESCE(SUM(CASE WHEN b.payment_status = 'PAID' THEN b.platform_commission END), 0) as total_commission_paid,
  COALESCE(AVG(CASE WHEN b.status = 'COMPLETED' AND r.rating IS NOT NULL THEN r.rating END), 0) as avg_rating,
  ROUND(
    CASE 
      WHEN COUNT(b.id) > 0 
      THEN (COUNT(CASE WHEN b.status = 'COMPLETED' THEN 1 END)::NUMERIC / COUNT(b.id)::NUMERIC) * 100 
      ELSE 0 
    END, 
    2
  ) as completion_rate_percent
FROM providers p
LEFT JOIN bookings b ON b.provider_id = p.id
LEFT JOIN reviews r ON r.provider_id = p.id
GROUP BY p.id, p.full_name, p.rating, p.review_count;

-- Provider Earnings by Time Period
CREATE OR REPLACE FUNCTION get_provider_earnings(
  p_provider_id UUID,
  p_period TEXT DEFAULT 'week', -- 'day', 'week', 'month', 'year'
  p_limit INTEGER DEFAULT 12
)
RETURNS TABLE(
  period_label TEXT,
  period_start TIMESTAMPTZ,
  total_earnings NUMERIC,
  job_count INTEGER,
  avg_job_value NUMERIC,
  commission_paid NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_trunc_format TEXT;
BEGIN
  -- Determine date_trunc format
  v_trunc_format := CASE p_period
    WHEN 'day' THEN 'day'
    WHEN 'week' THEN 'week'
    WHEN 'month' THEN 'month'
    WHEN 'year' THEN 'year'
    ELSE 'week'
  END;
  
  RETURN QUERY
  SELECT 
    TO_CHAR(date_trunc(v_trunc_format, b.created_at), 'YYYY-MM-DD') as period_label,
    date_trunc(v_trunc_format, b.created_at) as period_start,
    COALESCE(SUM(b.provider_earnings), 0) as total_earnings,
    COUNT(*)::INTEGER as job_count,
    COALESCE(AVG(b.provider_earnings), 0) as avg_job_value,
    COALESCE(SUM(b.platform_commission), 0) as commission_paid
  FROM bookings b
  WHERE b.provider_id = p_provider_id
    AND b.payment_status = 'PAID'
    AND b.created_at >= NOW() - (
      CASE p_period
        WHEN 'day' THEN INTERVAL '1 day' * p_limit
        WHEN 'week' THEN INTERVAL '1 week' * p_limit
        WHEN 'month' THEN INTERVAL '1 month' * p_limit
        WHEN 'year' THEN INTERVAL '1 year' * p_limit
        ELSE INTERVAL '1 week' * p_limit
      END
    )
  GROUP BY date_trunc(v_trunc_format, b.created_at)
  ORDER BY period_start DESC
  LIMIT p_limit;
END;
$$;

-- Provider Service Category Performance
CREATE OR REPLACE FUNCTION get_provider_category_performance(
  p_provider_id UUID
)
RETURNS TABLE(
  category_id UUID,
  category_name TEXT,
  job_count INTEGER,
  total_earnings NUMERIC,
  avg_rating NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sc.id as category_id,
    sc.name as category_name,
    COUNT(b.id)::INTEGER as job_count,
    COALESCE(SUM(CASE WHEN b.payment_status = 'PAID' THEN b.provider_earnings END), 0) as total_earnings,
    COALESCE(AVG(r.rating), 0) as avg_rating
  FROM bookings b
  JOIN service_categories sc ON sc.id = b.service_category_id
  LEFT JOIN reviews r ON r.booking_id = b.id
  WHERE b.provider_id = p_provider_id
    AND b.status = 'COMPLETED'
  GROUP BY sc.id, sc.name
  ORDER BY job_count DESC;
END;
$$;

-- ============================================
-- CLIENT ANALYTICS
-- ============================================

-- Client Analytics Summary View
CREATE OR REPLACE VIEW client_analytics AS
SELECT 
  u.id as user_id,
  u.email,
  COUNT(b.id) as total_bookings,
  COUNT(CASE WHEN b.status = 'COMPLETED' THEN 1 END) as completed_bookings,
  COUNT(CASE WHEN b.status = 'CANCELLED' THEN 1 END) as cancelled_bookings,
  COALESCE(SUM(CASE WHEN b.payment_status = 'PAID' THEN b.final_cost END), 0) as total_spent,
  COALESCE(AVG(CASE WHEN b.payment_status = 'PAID' THEN b.final_cost END), 0) as avg_booking_value,
  COUNT(DISTINCT b.provider_id) as unique_providers_used,
  COUNT(DISTINCT b.service_category_id) as unique_services_used,
  MAX(b.created_at) as last_booking_date,
  MIN(b.created_at) as first_booking_date
FROM auth.users u
LEFT JOIN bookings b ON b.user_id = u.id
GROUP BY u.id, u.email;

-- Client Spending by Time Period
CREATE OR REPLACE FUNCTION get_client_spending(
  p_user_id UUID,
  p_period TEXT DEFAULT 'month',
  p_limit INTEGER DEFAULT 12
)
RETURNS TABLE(
  period_label TEXT,
  period_start TIMESTAMPTZ,
  total_spent NUMERIC,
  booking_count INTEGER,
  avg_booking_value NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_trunc_format TEXT;
BEGIN
  v_trunc_format := CASE p_period
    WHEN 'day' THEN 'day'
    WHEN 'week' THEN 'week'
    WHEN 'month' THEN 'month'
    WHEN 'year' THEN 'year'
    ELSE 'month'
  END;
  
  RETURN QUERY
  SELECT 
    TO_CHAR(date_trunc(v_trunc_format, b.created_at), 'YYYY-MM-DD') as period_label,
    date_trunc(v_trunc_format, b.created_at) as period_start,
    COALESCE(SUM(b.final_cost), 0) as total_spent,
    COUNT(*)::INTEGER as booking_count,
    COALESCE(AVG(b.final_cost), 0) as avg_booking_value
  FROM bookings b
  WHERE b.user_id = p_user_id
    AND b.payment_status = 'PAID'
    AND b.created_at >= NOW() - (
      CASE p_period
        WHEN 'day' THEN INTERVAL '1 day' * p_limit
        WHEN 'week' THEN INTERVAL '1 week' * p_limit
        WHEN 'month' THEN INTERVAL '1 month' * p_limit
        WHEN 'year' THEN INTERVAL '1 year' * p_limit
        ELSE INTERVAL '1 month' * p_limit
      END
    )
  GROUP BY date_trunc(v_trunc_format, b.created_at)
  ORDER BY period_start DESC
  LIMIT p_limit;
END;
$$;

-- ============================================
-- PLATFORM ANALYTICS (Admin)
-- ============================================

-- Platform Metrics Function
CREATE OR REPLACE FUNCTION get_platform_metrics(
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_gmv NUMERIC;
  v_total_bookings INTEGER;
  v_completed_bookings INTEGER;
  v_cancelled_bookings INTEGER;
  v_platform_revenue NUMERIC;
  v_provider_earnings NUMERIC;
  v_avg_booking_value NUMERIC;
  v_unique_clients INTEGER;
  v_active_providers INTEGER;
  v_completion_rate NUMERIC;
BEGIN
  -- Calculate metrics
  SELECT 
    COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN final_cost END), 0),
    COUNT(*),
    COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END),
    COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END),
    COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN platform_commission END), 0),
    COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN provider_earnings END), 0),
    COALESCE(AVG(CASE WHEN payment_status = 'PAID' THEN final_cost END), 0),
    COUNT(DISTINCT user_id),
    COUNT(DISTINCT provider_id)
  INTO 
    v_gmv, v_total_bookings, v_completed_bookings, v_cancelled_bookings,
    v_platform_revenue, v_provider_earnings, v_avg_booking_value,
    v_unique_clients, v_active_providers
  FROM bookings
  WHERE created_at BETWEEN p_start_date AND p_end_date;
  
  -- Calculate completion rate
  v_completion_rate := CASE 
    WHEN v_total_bookings > 0 
    THEN ROUND((v_completed_bookings::NUMERIC / v_total_bookings::NUMERIC) * 100, 2)
    ELSE 0 
  END;
  
  -- Build result JSON
  v_result := jsonb_build_object(
    'period', jsonb_build_object(
      'start', p_start_date,
      'end', p_end_date
    ),
    'gmv', v_gmv,
    'total_bookings', v_total_bookings,
    'completed_bookings', v_completed_bookings,
    'cancelled_bookings', v_cancelled_bookings,
    'completion_rate_percent', v_completion_rate,
    'platform_revenue', v_platform_revenue,
    'provider_earnings', v_provider_earnings,
    'avg_booking_value', v_avg_booking_value,
    'unique_clients', v_unique_clients,
    'active_providers', v_active_providers
  );
  
  RETURN v_result;
END;
$$;

-- Platform Growth Metrics (MoM, WoW)
CREATE OR REPLACE FUNCTION get_platform_growth_metrics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_current_month JSONB;
  v_last_month JSONB;
  v_current_week JSONB;
  v_last_week JSONB;
BEGIN
  -- Current month
  v_current_month := get_platform_metrics(
    date_trunc('month', NOW()),
    NOW()
  );
  
  -- Last month
  v_last_month := get_platform_metrics(
    date_trunc('month', NOW() - INTERVAL '1 month'),
    date_trunc('month', NOW())
  );
  
  -- Current week
  v_current_week := get_platform_metrics(
    date_trunc('week', NOW()),
    NOW()
  );
  
  -- Last week
  v_last_week := get_platform_metrics(
    date_trunc('week', NOW() - INTERVAL '1 week'),
    date_trunc('week', NOW())
  );
  
  v_result := jsonb_build_object(
    'current_month', v_current_month,
    'last_month', v_last_month,
    'current_week', v_current_week,
    'last_week', v_last_week
  );
  
  RETURN v_result;
END;
$$;

COMMIT;
