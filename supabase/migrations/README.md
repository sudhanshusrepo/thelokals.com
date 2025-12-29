# Supabase Migrations - Documentation

**Last Updated**: December 29, 2025  
**Status**: Post-Cleanup (Phase 3)

---

## Current Migration Files (15)

### Applied to Production (13 core migrations)
1. `20250101000000_consolidated_schema.sql` - Initial consolidated schema
2. `20250114000000_add_provider_registration_columns.sql` - Provider registration
3. `20250120000000_phase_6_schema.sql` - Phase 6 schema updates
4. `20250122000000_restore_bible_schema.sql` - Bible schema restoration
5. `20250122000001_seed_services.sql` - Service seeds
6. `20251215000000_fix_booking_schema.sql` - Booking schema fixes
7. `20251216000000_storage_policies.sql` - Storage policies
8. `20251217_add_rpc_grants.sql` - RPC grants
9. `20251221000000_add_service_images.sql` - Service images
10. `20251221000001_backend_hardening.sql` - Backend hardening
11. `20251221000002_seed_service_categories.sql` - Service category seeds
12. `20251221000003_admin_sprint.sql` - Admin sprint
13. `20251222000000_fix_rls_bookings.sql` - RLS booking fixes

### Applied to Production (9 recent migrations)
14. `20251224183628_add_emoji_to_service_categories.sql` - Emoji support
15. `20251224202441_create_service_flags_and_audit_logs_v2.sql` - Service flags & audit
16. `20251224203438_create_waitlist_table.sql` - Waitlist table
17. `20251224204019_create_provider_requests_table.sql` - Provider requests
18. `20251228202204_create_admin_audit_logs.sql` - Admin audit logs
19. `20251228215123_fix_prod_admin_login_final_v2.sql` - Admin login fix
20. `20251228221058_fix_prod_admin_password_force.sql` - Admin password fix
21. `20251228222357_hard_delete_admin_prod_v2.sql` - Admin hard delete
22. `20251228224436_promote_new_admin_v3.sql` - Admin promotion
23. `20251229043000_critical_security_fixes.sql` - ✅ **RLS security fixes (Dec 29)**

### Unapplied (1 migration)
- `20250123000000_provider_approval_workflow.sql` - Provider approval workflow
  - **Status**: Valid but not applied
  - **Action**: Defer to future sprint or apply when needed

---

## Cleanup History (December 29, 2025)

### Deleted Files (16 total)

**Debug Migrations** (8 files - Dec 28-29):
- `20251228120000_fix_categories_slugs.sql`
- `20251228180000_fix_admin_rls.sql`
- `20251228181000_fix_admin_grants.sql`
- `20251228190000_fix_provider_access.sql`
- `20251228193000_fix_service_categories_access.sql`
- `20251228200000_force_service_categories_rls.sql`
- `20251228203000_admin_update_providers.sql`
- `20251228213000_fix_rls_with_security_definer.sql`

**Superseded Migrations** (8 files):
- `20251229023000_create_admin_audit_logs.sql` (superseded by `20251228202204`)
- `20251229024500_fix_admin_audit_logs_columns.sql`
- `20251229033000_seed_test_provider.sql` (test data)
- `20251229040000_enable_profiles_rls.sql`
- `20251229050000_fix_admin_user_seed.sql` (manual fix used)
- `20251229060000_fix_admin_features.sql`
- `20251229070000_audit_triggers.sql`
- `20251229080000_force_refresh_ddl.sql`

**Rationale**: These migrations were created during debugging but never applied to production. Manual SQL fixes were used instead.

---

## Migration Strategy

### For Fresh Databases
```bash
npx supabase db reset
```
This will apply all 23 migrations in order.

### For Existing Databases
Production database already has all 23 migrations applied. No action needed.

### Adding New Migrations
1. Use timestamped naming: `YYYYMMDDHHMMSS_description.sql`
2. Test locally first: `npx supabase db reset`
3. Apply to production via Supabase MCP: `apply_migration`
4. Commit to git after successful application

---

## Security Status

**Latest Security Audit** (Dec 29, 2025):
- ✅ RLS enabled on `providers` table
- ✅ RLS enabled on `service_pricing` table
- ⚠️ 11 security issues remaining (down from 15)
- 📋 Full audit: [backend_audit.md](file:///C:/Users/sudhanshu/.gemini/antigravity/brain/4fcfc0b0-6c5a-4598-8ef0-1475b2025569/backend_audit.md)

---

## Production Database State

**Project**: `gdnltvvxiychrsdzenia` (thelokals.com)  
**Applied Migrations**: 23  
**Tables**: 38  
**Users**: 241  
**Last Migration**: `20251229043000_critical_security_fixes.sql`

---

## Questions?

Refer to:
- [Backend Audit Report](file:///C:/Users/sudhanshu/.gemini/antigravity/brain/4fcfc0b0-6c5a-4598-8ef0-1475b2025569/backend_audit.md)
- [Cleanup Implementation Plan](file:///C:/Users/sudhanshu/.gemini/antigravity/brain/4fcfc0b0-6c5a-4598-8ef0-1475b2025569/implementation_plan.md)
