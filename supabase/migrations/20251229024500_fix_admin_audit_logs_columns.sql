-- Fix admin_audit_logs columns
ALTER TABLE public.admin_audit_logs 
RENAME COLUMN details TO changes;

ALTER TABLE public.admin_audit_logs 
ADD COLUMN resource_type TEXT;
