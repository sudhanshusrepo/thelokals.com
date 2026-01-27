
# Launch Cutover Checklist

## Pre-Flight
- [ ] **DB Perf Check**: Ensure `effective_service_availability` view is refreshed.
- [ ] **Worker Smoke Test**: Validate `https://geo-availability.workers.dev/check` returns 200 OK.
- [ ] **App Builds**: Confirm all client apps have `geoAvailability.ts` integrated.

## Deployment
- [ ] **Step 1**: Deploy Migration `launch/feature-flags.sql`.
- [ ] **Step 2**: Toggle Feature Flag to `TRUE` (Canary/Global).
- [ ] **Step 3**: Purge Cloudflare Cache (optional, to ensure fresh logic).

## Monitoring (First 1 Hour)
- [ ] **Grafana**: Watch "RPC Latency" - should drop as Worker takes load.
- [ ] **Grafana**: Watch "Cache Hit Rate" - should climb to >90%.
- [ ] **Sentry**: Check for spike in `fetch` errors.

## Sign-off
- [ ] **Ops Lead**: __________________
- [ ] **Product Owner**: __________________
