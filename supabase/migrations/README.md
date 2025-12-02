# Supabase Migrations - History & Documentation

**Last Updated**: 2025-12-03

---

## Active Migrations

The following migrations are **active** and should be applied in order:

1. **`20251203000000_consolidated_schema.sql`** (18,552 bytes)
   - Consolidates all core schema, dynamic pricing, online services, admin panel, and booking lifecycle phase 1
   - Replaces legacy migrations 01-05 and redundant timestamped migrations
   
2. **`20251203000001_booking_lifecycle_phase2.sql`** (3,269 bytes)
   - Booking requests table and matching logic
   
3. **`20251203000002_booking_webhook.sql`** (3,627 bytes)
   - Webhook trigger template for booking processing

4. **`fix_rls_policies.sql`** (1,279 bytes)
   - RLS policy fixes for profiles table

---

## Archived Migrations

### Legacy Migrations (`archive/legacy/`)

These migrations were superseded by the consolidated schema:

- `01_core_schema.sql` - Core tables (profiles, providers, service_categories)
- `02_booking_system.sql` - Booking system tables and logic
- `03_admin_panel.sql` - Admin panel tables
- `04_dynamic_pricing.sql` - Dynamic pricing schema
- `05_seeds.sql` - Seed data

**Status**: ❌ **Do not apply** - Content merged into `20251203000000_consolidated_schema.sql`

### Redundant Timestamped Migrations (`archive/redundant/`)

These migrations were consolidated into the main schema:

- `20251201000001_dynamic_pricing_schema.sql` - Merged into consolidated
- `20251202000001_online_services_seed.sql` - Merged into consolidated
- `20251202000002_admin_panel_foundation.sql` - Merged into consolidated
- `20251202000003_booking_lifecycle_phase1.sql` - Merged into consolidated

**Status**: ❌ **Do not apply** - Content merged into `20251203000000_consolidated_schema.sql`

---

## Migration Strategy

### For Fresh Databases
Apply migrations in this order:
1. `20251203000000_consolidated_schema.sql`
2. `20251203000001_booking_lifecycle_phase2.sql`
3. `20251203000002_booking_webhook.sql`
4. `fix_rls_policies.sql`

### For Existing Databases
If you've already applied legacy migrations (01-05), the consolidated schema will handle conflicts gracefully with `CREATE TABLE IF NOT EXISTS` and `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object THEN null; END $$;` patterns.

---

## Archive Rationale

**Why archive?**
- **Reduce confusion**: Single source of truth for schema
- **Improve maintainability**: Fewer files to manage
- **Preserve history**: Archived files available for reference
- **Prevent errors**: Avoid applying duplicate/conflicting migrations

**Consolidation Date**: 2025-12-03  
**Consolidated By**: Repository deduplication initiative (Phase 1)

---

## Future Migrations

New migrations should:
1. Use timestamped naming: `YYYYMMDDHHMMSS_description.sql`
2. Be incremental (not consolidations)
3. Include rollback instructions in comments
4. Test on local database before committing

---

## Questions?

Refer to the [deduplication report](file:///C:/Users/sudhanshu/.gemini/antigravity/brain/8d9ab5cf-c30a-406f-9772-db4ceeee73a2/deduplication_report.md) for full analysis.
