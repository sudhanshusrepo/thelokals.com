-- Migration: 20260106000001_consolidate_admin_roles.sql
-- Purpose: Remove role_v2 and consolidate on role (uppercase enum)

BEGIN;

-- 1. Update role column based on role_v2 values (if any divergence)
-- Mapping: super_admin -> SUPER_ADMIN
UPDATE public.admin_users SET role = 'SUPER_ADMIN' WHERE role_v2 = 'super_admin';
-- Add other mappings if needed, but for now we only know of super_admin

-- 2. Drop the role_v2 column
ALTER TABLE public.admin_users DROP COLUMN IF EXISTS role_v2;

-- 3. Drop the old enum type if it exists
DROP TYPE IF EXISTS public.admin_role_v2;

COMMIT;
