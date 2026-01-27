
# Rollback Plan

**Trigger**: Error rate > 1% OR User complaints of valid services being blocked.

## Procedure

1.  **Immediate Disable (Feature Flag)**
    ```sql
    UPDATE app_config SET value = 'false' WHERE key = 'geo_availability_enabled';
    ```
    *Impact*: Apps will revert to "Fail Open" (Allow all services) or legacy behavior depending on client logic defaults.

2.  **Worker Bypass (DNS/Routing - Optional)**
    If Worker is causing latency, change DNS/Env Var `EDGE_API_URL` to empty strings in Vercel/Netlify to force direct RPC fallback.

3.  **Data Revert (Extreme Case)**
    If data corruption in `service_availability`:
    ```sql
    TRUNCATE service_availability;
    ```
    *Result*: All services become globally enabled (default state).

## Communications
-   Notify #outage channel.
-   Update Status Page: "Geo-availability degradation - defaulting to open access."
