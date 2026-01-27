
-- monitoring/supabase-queries.sql
-- 1. Check for slow queries (>100ms)
SELECT 
  pid, user, dbid, query, query_start, state 
FROM pg_stat_activity 
WHERE state = 'active'
AND (now() - query_start) > interval '100 milliseconds';

-- 2. Cache Miss Rate Proxy (Check RPC calls vs Total Requests - needs Access Logs or custom metrics)
-- This query checks how often the fallback RPC is actually hit
SELECT 
  calls, total_exec_time, mean_exec_time, rows 
FROM pg_stat_statements 
WHERE query LIKE '%resolve_service_availability%';

-- 3. Connection Usage
SELECT count(*), state FROM pg_stat_activity GROUP BY state;

-- 4. Effective Availability View Refresh Status (Last Refresh)
-- Postgres doesn't track this natively in a simple view without extensions, 
-- but we can check the table stats
SELECT last_analyze, last_autoanalyze FROM pg_stat_user_tables WHERE relname = 'effective_service_availability';
