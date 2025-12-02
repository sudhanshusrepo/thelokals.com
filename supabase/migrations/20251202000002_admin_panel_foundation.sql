-- Admin Panel Database Schema
-- Migration: 20251202_admin_panel_foundation.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admin users table with Google SSO support
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  google_id TEXT UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'ops_admin', 'read_only')),
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service availability matrix for location-based control
CREATE TABLE IF NOT EXISTS service_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_category_id UUID NOT NULL,
  location_type TEXT NOT NULL CHECK (location_type IN ('city', 'area', 'pincode')),
  location_value TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ENABLED', 'DISABLED')),
  reason TEXT,
  disabled_by UUID REFERENCES admin_users(id),
  disabled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_category_id, location_type, location_value)
);

-- Active sessions tracking for real-time monitoring
CREATE TABLE IF NOT EXISTS active_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('customer', 'provider')),
  session_state TEXT,
  city TEXT,
  current_booking_id UUID,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin audit logs for compliance and tracking
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID REFERENCES admin_users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  changes JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_service_availability_lookup 
  ON service_availability(service_category_id, location_value);

CREATE INDEX IF NOT EXISTS idx_service_availability_status 
  ON service_availability(status) WHERE status = 'DISABLED';

CREATE INDEX IF NOT EXISTS idx_active_sessions_recent 
  ON active_sessions(last_activity DESC) 
  WHERE last_activity > NOW() - INTERVAL '5 minutes';

CREATE INDEX IF NOT EXISTS idx_active_sessions_user 
  ON active_sessions(user_id, user_type);

CREATE INDEX IF NOT EXISTS idx_audit_logs_recent 
  ON admin_audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin 
  ON admin_audit_logs(admin_user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only authenticated admin users can access these tables
CREATE POLICY admin_users_policy ON admin_users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY service_availability_read ON service_availability
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY service_availability_write ON service_availability
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'ops_admin')
    )
  );

CREATE POLICY audit_logs_read ON admin_audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY active_sessions_read ON active_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_availability_updated_at
  BEFORE UPDATE ON service_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up old active sessions (older than 1 hour)
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM active_sessions
  WHERE last_activity < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Insert default super admin (update email as needed)
INSERT INTO admin_users (email, role, full_name)
VALUES ('admin@thelokals.com', 'super_admin', 'System Administrator')
ON CONFLICT (email) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE admin_users IS 'Admin users with role-based access control';
COMMENT ON TABLE service_availability IS 'Location-wise service availability matrix';
COMMENT ON TABLE active_sessions IS 'Real-time tracking of active user sessions';
COMMENT ON TABLE admin_audit_logs IS 'Audit trail for all admin actions';
