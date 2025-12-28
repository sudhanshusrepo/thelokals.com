-- Critical Security Fixes
-- Date: 2025-12-29 04:30 UTC
-- Purpose: Enable RLS on critical tables to prevent unauthorized data access

BEGIN;

-- 1. Enable RLS on providers table (policies already exist)
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

-- 2. Enable RLS on service_pricing and add policies
ALTER TABLE public.service_pricing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view pricing" ON public.service_pricing;
CREATE POLICY "Public can view pricing"
    ON public.service_pricing
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can manage pricing" ON public.service_pricing;
CREATE POLICY "Admins can manage pricing"
    ON public.service_pricing
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE id = auth.uid()
        )
    );

COMMIT;
