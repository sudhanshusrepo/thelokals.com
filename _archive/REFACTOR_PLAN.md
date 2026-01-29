# Repository Refactor Plan: Production Readiness

**Objective**: Clean, optimize, and standardize the codebase to creating a "fresh" production-grade repository while maintaining current application functionality.
**Constraint**: Do not break existing working state.

## Sprint 1: Web Client Facelift (`apps/web-client`)
- **Cleanup**: Remove unused components, console logs, and commented-out code.
- **Standards**: Verify Next.js best practices (Image optimization, semantic tags).
- **Styles**: Consolidate redundant CSS/Tailwind classes.
- **Linting**: Fix all eslint warnings and strict mode issues.

## Sprint 2: Web Provider Cleanup (`apps/web-provider`)
- **Cleanup**: Remove temporary debugging logs from Live Booking implementation.
- **Refactor**: Ensure `BookingRequestModal` and `Dashboard` logic is cleanly separated.
- **Standards**: consistent use of `platform-core` hooks.
- **Linting**: Fix specific provider-app lint issues.

## Sprint 3: Web Admin Optimization (`apps/web-admin`)
- **Cleanup**: Remove legacy "service_locations" references if fully bridged.
- **Standards**: Ensure Admin UI components match the new design system.
- **Linting**: Comprehensive lint pass.

## Sprint 4: Mobile Provider (`apps/mobile-provider`)
- **Review**: Check for React Native specific cruft or unused assets.
- **Alignment**: Ensure it uses the latest `platform-core` types.

## Sprint 5: Platform Core Standardization (`packages/platform-core`)
- **Consolidation**: Verify exports in `index.ts`. Remove duplicate types.
- **Services**: Ensure `liveBookingService`, `geoService`, and `bookingService` have clear, non-overlapping responsibilities.
- **Types**: Unify `Booking`, `LiveBooking`, and `Job` types if divergent.

## Sprint 6: Repository & Configuration (`Root`)
- **Scripts**: Remove temporary migration scripts (e.g., `apply_live_booking_migrations.js`).
- **Migrations**: organize SQL files. Ensure `010` is properly recognized.
- **Config**: Clean `package.json`, `wrangler.toml`, and `.gitignore`.
- **Docs**: Update `README.md` and `DEPLOYMENT.md` to reflect the final state.
