-- Migration: Admin System
-- Description: Admin users, location configuration, and audit logs
-- Phase: 3 of 6
-- Idempotent: Safe to re-run

-- Create Admin Users Table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users NOT NULL UNIQUE,
    role text NOT NULL CHECK (role IN ('SUPER_ADMIN', 'LOCATION_MANAGER', 'SUPPORT')),
    permissions jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create Location Configs Table
CREATE TABLE IF NOT EXISTS public.location_configs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL UNIQUE,
    is_active boolean DEFAULT true,
    service_availability jsonb DEFAULT '{}', -- e.g. {"cleaning": true, "plumbing": false}
    feature_flags jsonb DEFAULT '{}', -- e.g. {"ai_booking": true}
    center_point geography(Point, 4326),
    radius_km numeric DEFAULT 10,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id uuid REFERENCES public.admin_users(id),
    action text NOT NULL,
    target_table text,
    target_id uuid,
    details jsonb,
    ip_address text,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Admin Users: Only Super Admins can manage admin users
CREATE POLICY "Super Admins can manage admin users" ON public.admin_users
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.role = 'SUPER_ADMIN'
        )
    );

-- Admin Users: Admins can view themselves
CREATE POLICY "Admins can view themselves" ON public.admin_users
    FOR SELECT
    USING (user_id = auth.uid());

-- Location Configs: Admins can view and edit
CREATE POLICY "Admins can view location configs" ON public.location_configs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can edit location configs" ON public.location_configs
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.role IN ('SUPER_ADMIN', 'LOCATION_MANAGER')
        )
    );

-- Also allow public read access for location configs (for the app to check availability)
CREATE POLICY "Public can view active location configs" ON public.location_configs
    FOR SELECT
    USING (is_active = true);

-- Audit Logs: Admins can view, System inserts
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can insert audit logs" ON public.admin_audit_logs
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid()
        )
    );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_location_configs_name ON public.location_configs(name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_location_configs_updated_at
    BEFORE UPDATE ON public.location_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
