-- ============================================
-- SPRINT 10: RBAC & AUDIT SECURITY
-- ============================================

-- Function to get current admin role
CREATE OR REPLACE FUNCTION get_admin_role()
RETURNS text AS $$
BEGIN
  RETURN (SELECT role::text FROM public.admin_users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 1. Secure Admin Activity Logs
-- Only admins can insert. Only Super Admins can delete (or no one).
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_logs_insert" ON public.admin_activity_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

CREATE POLICY "admin_logs_select_super" ON public.admin_activity_logs
  FOR SELECT USING (
    get_admin_role() = 'SUPER_ADMIN'
  );

-- No UPDATE or DELETE allowed generally.

-- 2. Secure System Configs
ALTER TABLE public.system_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "configs_read_all" ON public.system_configs
  FOR SELECT USING (true); -- Public read needed for frontend/backend

CREATE POLICY "configs_update_ops_super" ON public.system_configs
  FOR UPDATE USING (
    get_admin_role() IN ('SUPER_ADMIN', 'OPS_ADMIN')
  );

-- 3. Secure Marketing Banners
ALTER TABLE public.marketing_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "banners_read_all" ON public.marketing_banners
  FOR SELECT USING (true);

CREATE POLICY "banners_all_ops_super" ON public.marketing_banners
  FOR ALL USING (
    get_admin_role() IN ('SUPER_ADMIN', 'OPS_ADMIN')
  );

-- 4. Secure Payments (Retroactive Sprint 6)
-- Only Finance and Super Admin can update payments
CREATE POLICY "payments_update_finance_super" ON public.payment_transactions
  FOR UPDATE USING (
    get_admin_role() IN ('SUPER_ADMIN', 'FINANCE_ADMIN')
  );
