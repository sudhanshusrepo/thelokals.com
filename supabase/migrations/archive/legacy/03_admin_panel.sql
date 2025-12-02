-- 03_admin_panel.sql
-- Admin Panel: Admin Users, Audit Logs, Service Availability, Active Sessions

-- 1. Admin Users Table (using text instead of admin_role enum for flexibility)
DROP TABLE IF EXISTS public.admin_users CASCADE;
CREATE TABLE public.admin_users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  google_id text UNIQUE,
  role text NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT')),
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Service Availability Matrix
DROP TABLE IF EXISTS public.service_availability CASCADE;
CREATE TABLE public.service_availability (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_category_id uuid NOT NULL,
  location_type text NOT NULL CHECK (location_type IN ('city', 'area', 'pincode')),
  location_value text NOT NULL,
  status text NOT NULL CHECK (status IN ('ENABLED', 'DISABLED')),
  reason text,
  disabled_by uuid REFERENCES public.admin_users(id),
  disabled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(service_category_id, location_type, location_value)
);

-- 3. Active Sessions Tracking
DROP TABLE IF EXISTS public.active_sessions CASCADE;
CREATE TABLE public.active_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('customer', 'provider')),
  session_state text,
  city text,
  current_booking_id uuid,
  last_activity timestamptz DEFAULT now(),
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- 4. Admin Audit Logs (using admin_id instead of admin_user_id)
DROP TABLE IF EXISTS public.admin_audit_logs CASCADE;
CREATE TABLE public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id uuid REFERENCES public.admin_users(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  changes jsonb,
  ip_address inet,
  created_at timestamptz DEFAULT now()
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_service_availability_lookup 
  ON public.service_availability(service_category_id, location_value);

CREATE INDEX IF NOT EXISTS idx_service_availability_status 
  ON public.service_availability(status) WHERE status = 'DISABLED';

CREATE INDEX IF NOT EXISTS idx_active_sessions_recent 
  ON public.active_sessions(last_activity DESC);

CREATE INDEX IF NOT EXISTS idx_active_sessions_user 
  ON public.active_sessions(user_id, user_type);

CREATE INDEX IF NOT EXISTS idx_audit_logs_recent 
  ON public.admin_audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin 
  ON public.admin_audit_logs(admin_id, created_at DESC);

-- 6. Functions
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.active_sessions
  WHERE last_activity < now() - interval '1 hour';
END;
$$ LANGUAGE plpgsql;

-- 7. Triggers
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_availability_updated_at ON public.service_availability;
CREATE TRIGGER update_service_availability_updated_at
  BEFORE UPDATE ON public.service_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. RLS Policies
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

-- Admin Users Policies
DROP POLICY IF EXISTS "admin_users_policy" ON public.admin_users;
CREATE POLICY "admin_users_policy" ON public.admin_users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid()
    )
  );

-- Service Availability Policies
DROP POLICY IF EXISTS "service_availability_read" ON public.service_availability;
CREATE POLICY "service_availability_read" ON public.service_availability
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "service_availability_write" ON public.service_availability;
CREATE POLICY "service_availability_write" ON public.service_availability
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid() 
      AND role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- Audit Logs Policies
DROP POLICY IF EXISTS "audit_logs_read" ON public.admin_audit_logs;
CREATE POLICY "audit_logs_read" ON public.admin_audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid()
    )
  );

-- Active Sessions Policies
DROP POLICY IF EXISTS "active_sessions_read" ON public.active_sessions;
CREATE POLICY "active_sessions_read" ON public.active_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid()
    )
  );

-- Grant Permissions
GRANT ALL ON public.admin_users TO authenticated;
GRANT ALL ON public.service_availability TO authenticated;
GRANT ALL ON public.active_sessions TO authenticated;
GRANT ALL ON public.admin_audit_logs TO authenticated;

-- Comments
COMMENT ON TABLE public.admin_users IS 'Admin users with role-based access control';
COMMENT ON TABLE public.service_availability IS 'Location-wise service availability matrix';
COMMENT ON TABLE public.active_sessions IS 'Real-time tracking of active user sessions';
COMMENT ON TABLE public.admin_audit_logs IS 'Audit trail for all admin actions';
