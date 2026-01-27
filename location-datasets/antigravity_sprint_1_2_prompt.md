# ANTIGRAVITY PROMPT: Sprint 1 & 2 Implementation Bundle
**For:** thelokals.com Geo-Service Availability System  
**Date:** January 27, 2026  
**Status:** Ready to Execute  

---

## 🎯 OBJECTIVE

Implement hierarchical service controls (State → City → Pincode) with admin enable/disable capability. Enables thelokals to manage service availability granularly across India. **Zero downtime, feature-flagged deployment.**

---

## 📦 DELIVERABLES

### What You Will Receive
1. Refined, production-ready geo dataset (27 states, 464 cities, 20,930 pincodes)
2. Complete SQL migration bundle (001-004 migrations)
3. Validation test suite (20+ test cases)
4. Admin API + Worker code (stateless)
5. Deployment checklist

### What Antigravity Must Deliver
1. Executed migrations on staging Supabase
2. Seeded geo data + sample services
3. Working Admin RPC endpoints
4. Validated Worker cache logic
5. All 5 apps passing build + API tests

---

## 🗂️ INPUT FILES (PROVIDED)

```
📁 Refined Dataset
├─ lokals_pincode_hierarchy_clean.csv (20,930 rows)
│  └─ Columns: pincode, category, zone, state, city, is_serviceable
├─ lokals_geo_hierarchy.json (State → City → Pincode tree)
└─ lokals_service_coverage.json (Service reach map)

📁 Antigravity Reference
├─ antigravity_sprint1_data_ref.md (This document + data validation)
├─ sprint1_sprint2_consolidated.json (Below)
└─ schema_rpc_definitions.sql (RPC logic)
```

---

## SPRINT 1: GEO DATA FOUNDATION (Days 1-5)

### 📋 Tasks

#### Task 1.1: Create Geo Tables
**Expected SQL Output:**
```sql
-- 001_create_geo_tables.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(5) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id UUID REFERENCES states(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(state_id, name)
);

CREATE TABLE pincodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE NOT NULL,
  pincode CHAR(6) UNIQUE NOT NULL,
  cluster VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for O(1) lookups
CREATE INDEX idx_pincodes_pincode ON pincodes(pincode);
CREATE INDEX idx_pincodes_city_id ON pincodes(city_id);
CREATE INDEX idx_cities_state_id ON cities(state_id);
```

**Validation:**
```sql
SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('states', 'cities', 'pincodes');
-- Expected: 3
```

---

#### Task 1.2: Seed State Data (27 records)
**Input:** Extract from `lokals_geo_hierarchy.json` unique state list

**Generate SQL:**
```sql
-- 002_seed_states.sql

INSERT INTO states (name, code) VALUES
('ANDHRA PRADESH', 'AP'),
('ARUNACHAL PRADESH', 'AR'),
('ASSAM', 'AS'),
('BIHAR', 'BR'),
('CHHATTISGARH', 'CG'),
('DELHI', 'DL'),
('GOA', 'GA'),
('GUJARAT', 'GJ'),
('HARYANA', 'HR'),
('HIMACHAL PRADESH', 'HP'),
('JAMMU AND KASHMIR', 'JK'),
('JHARKHAND', 'JH'),
('KARNATAKA', 'KA'),
('KERALA', 'KL'),
('MADHYA PRADESH', 'MP'),
('MAHARASHTRA', 'MH'),
('MEGHALAYA', 'ML'),
('ODISHA', 'OD'),
('PUNJAB', 'PB'),
('RAJASTHAN', 'RJ'),
('TAMIL NADU', 'TN'),
('TELANGANA', 'TG'),
('TRIPURA', 'TR'),
('UTTAR PRADESH', 'UP'),
('UTTARAKHAND', 'UK'),
('WEST BENGAL', 'WB')
ON CONFLICT (code) DO NOTHING;
```

**Validation:**
```sql
SELECT COUNT(*) FROM states;
-- Expected: 27
```

---

#### Task 1.3: Seed Cities Data (464 records)
**Input:** Parse `lokals_geo_hierarchy.json` → generate INSERT for each state/city pair

**Generate SQL (Pattern):**
```sql
-- 002b_seed_cities.sql
-- (Generate dynamically: 464 total inserts)

-- ANDHRA PRADESH (74 cities)
INSERT INTO cities (state_id, name) VALUES
  ((SELECT id FROM states WHERE code='AP'), 'ADONI'),
  ((SELECT id FROM states WHERE code='AP'), 'ANAKAPALLI'),
  ((SELECT id FROM states WHERE code='AP'), 'ANANTAPUR'),
  ... (72 more for AP)

-- MAHARASHTRA (56 cities)
INSERT INTO cities (state_id, name) VALUES
  ((SELECT id FROM states WHERE code='MH'), 'MUMBAI'),
  ((SELECT id FROM states WHERE code='MH'), 'PUNE'),
  ((SELECT id FROM states WHERE code='MH'), 'NAGPUR'),
  ... (53 more for MH)

-- ... (repeat for all 27 states)
```

**Validation:**
```sql
SELECT state_id, COUNT(*) as city_count FROM cities
GROUP BY state_id ORDER BY city_count DESC;
-- Expected: MH=56, AP=74, TN=43, UP=52, KA=30, ... (464 total)
```

---

#### Task 1.4: Bulk Insert Pincodes (20,930 records)
**Input:** `lokals_pincode_hierarchy_clean.csv`

**Generate SQL:**
```sql
-- 002c_seed_pincodes.sql

COPY pincodes (city_id, pincode, cluster)
FROM STDIN WITH (FORMAT csv);

-- OR for large bulk:
COPY pincodes (city_id, pincode, cluster) 
FROM '/tmp/lokals_pincode_hierarchy_clean.csv' WITH (FORMAT csv);
```

**Pre-import mapping:** Translate CSV state/city → cities.id (join lookup)

**Validation:**
```sql
SELECT COUNT(*) FROM pincodes;
-- Expected: 20,930

-- Spot check: Verify hierarchical integrity
SELECT p.pincode, c.name as city, s.name as state
FROM pincodes p
JOIN cities c ON p.city_id = c.id
JOIN states s ON c.state_id = s.id
WHERE p.pincode IN ('400001', '560001', '600001', '110001', '700001');
-- Expected: Correct state/city for each sample pincode
```

---

#### Task 1.5: Verify Coverage
**Run Coverage Script:**
```sql
-- 003_validate_coverage.sql

SELECT 
  s.name as state,
  COUNT(DISTINCT c.id) as city_count,
  COUNT(DISTINCT p.id) as pincode_count
FROM states s
LEFT JOIN cities c ON s.id = c.state_id
LEFT JOIN pincodes p ON c.id = p.city_id
GROUP BY s.id, s.name
ORDER BY pincode_count DESC;
-- Expected: 27 states, 464 cities total, 20,930 pincodes

SELECT COUNT(*) as state_total FROM states;  -- Expected: 27
SELECT COUNT(*) as city_total FROM cities;   -- Expected: 464
SELECT COUNT(*) as pincode_total FROM pincodes; -- Expected: 20,930
```

**Success Criteria (ALL must pass):**
- [ ] 27 states inserted
- [ ] 464 cities with correct FK relationships
- [ ] 20,930 pincodes with correct FK relationships
- [ ] No NULL values in core columns
- [ ] Pincode UNIQUE constraint active
- [ ] Spot checks: 400001→Mumbai→MH, 560001→Bangalore→KA, etc.

---

### 📊 Sprint 1 Output

```
✅ Migrations deployed: 001-003_*.sql
✅ Geo data seeded: 27 states, 464 cities, 20,930 pincodes
✅ Coverage report: 100% serviceable pincodes
✅ Validation: All queries return expected counts
✅ Ready for Sprint 2
```

---

## SPRINT 2: SERVICES + AVAILABILITY RULES (Days 6-10)

### 📋 Tasks

#### Task 2.1: Create Services Table
**Expected SQL:**
```sql
-- 004_create_services.sql

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  is_globally_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_services_code ON services(code);
```

#### Task 2.2: Seed Initial Services
**Input:** From `lokals_service_coverage.json` + predefined marketplace services

**Generate SQL:**
```sql
-- 004b_seed_services.sql

INSERT INTO services (name, code, is_globally_enabled) VALUES
('Plumbing', 'PLUMBING', true),
('Electrical', 'ELECTRICAL', true),
('Cleaning', 'CLEANING', true),
('Furniture Assembly', 'FURNITURE', true),
('AC Repair', 'AC_REPAIR', true),
('Home Maintenance', 'HOME_MAINT', true),
('Pest Control', 'PEST_CONTROL', true),
('Appliance Repair', 'APPLIANCE', true),
('Painting', 'PAINTING', true),
('Carpentry', 'CARPENTRY', true)
ON CONFLICT (code) DO NOTHING;
```

---

#### Task 2.3: Create Service Availability Rules Table
**Expected SQL:**
```sql
-- 005_create_service_availability.sql

CREATE TABLE service_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE NOT NULL,
  scope_type VARCHAR(10) CHECK (scope_type IN ('STATE', 'CITY', 'PINCODE')) NOT NULL,
  scope_id UUID NOT NULL,
  is_enabled BOOLEAN NOT NULL,
  priority INT NOT NULL CHECK (priority IN (1, 2, 3)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_id, scope_type, scope_id)
);

CREATE INDEX idx_sa_service_scope ON service_availability(service_id, scope_type, scope_id);
CREATE INDEX idx_sa_priority ON service_availability(priority DESC);
```

**Priority Rules:**
- STATE = 1 (lowest specificity, highest authority)
- CITY = 2
- PINCODE = 3 (highest specificity, can override)

---

#### Task 2.4: Create Resolution RPC
**Expected SQL:**
```sql
-- 005b_create_availability_rpc.sql

CREATE OR REPLACE FUNCTION resolve_service_availability(
  p_service_code VARCHAR,
  p_pincode CHAR(6)
) RETURNS TABLE (
  service_code VARCHAR,
  pincode CHAR(6),
  is_enabled BOOLEAN,
  resolved_scope TEXT,
  scope_name VARCHAR
) AS $$
DECLARE
  v_service_id UUID;
  v_pincode_id UUID;
  v_city_id UUID;
  v_state_id UUID;
  v_rule_id UUID;
  v_is_enabled BOOLEAN;
  v_scope_type VARCHAR;
  v_scope_name VARCHAR;
BEGIN
  -- 1. Fetch service ID
  SELECT id INTO v_service_id FROM services WHERE code = p_service_code;
  IF v_service_id IS NULL THEN RAISE EXCEPTION 'Service not found'; END IF;

  -- 2. Resolve pincode → city → state hierarchy
  SELECT p.id, c.id, s.id INTO v_pincode_id, v_city_id, v_state_id
  FROM pincodes p
  JOIN cities c ON p.city_id = c.id
  JOIN states s ON c.state_id = s.id
  WHERE p.pincode = p_pincode;
  
  IF v_pincode_id IS NULL THEN RAISE EXCEPTION 'Pincode not found'; END IF;

  -- 3. Query matching rules ORDER BY priority DESC (most specific first)
  SELECT id, is_enabled, scope_type, 
    CASE scope_type
      WHEN 'STATE' THEN (SELECT name FROM states WHERE id = scope_id)
      WHEN 'CITY' THEN (SELECT name FROM cities WHERE id = scope_id)
      WHEN 'PINCODE' THEN p_pincode
    END
  INTO v_rule_id, v_is_enabled, v_scope_type, v_scope_name
  FROM service_availability
  WHERE service_id = v_service_id
  AND (
    (scope_type = 'PINCODE' AND scope_id = v_pincode_id::VARCHAR)
    OR (scope_type = 'CITY' AND scope_id = v_city_id::VARCHAR)
    OR (scope_type = 'STATE' AND scope_id = v_state_id::VARCHAR)
  )
  ORDER BY priority DESC
  LIMIT 1;

  -- 4. Fallback: If no rule → use global flag
  IF v_rule_id IS NULL THEN
    SELECT is_globally_enabled, code INTO v_is_enabled, service_code
    FROM services WHERE id = v_service_id;
    v_scope_type := 'GLOBAL';
    v_scope_name := 'Platform Default';
  END IF;

  RETURN QUERY SELECT 
    p_service_code,
    p_pincode,
    v_is_enabled,
    v_scope_type,
    v_scope_name;
END;
$$ LANGUAGE plpgsql;
```

---

#### Task 2.5: Create Write Guards (Triggers)
**Expected SQL:**
```sql
-- 005c_create_write_guards.sql

-- Prevent PINCODE enable if CITY disabled
CREATE OR REPLACE FUNCTION check_parent_availability() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.scope_type = 'PINCODE' AND NEW.is_enabled = true THEN
    -- Check if parent CITY disabled
    IF EXISTS (
      SELECT 1 FROM service_availability
      WHERE service_id = NEW.service_id
      AND scope_type = 'CITY'
      AND scope_id = (SELECT city_id FROM pincodes WHERE id = NEW.scope_id::UUID)
      AND is_enabled = false
    ) THEN
      RAISE EXCEPTION 'Cannot enable PINCODE when parent CITY is disabled';
    END IF;
    
    -- Check if parent STATE disabled
    IF EXISTS (
      SELECT 1 FROM service_availability
      WHERE service_id = NEW.service_id
      AND scope_type = 'STATE'
      AND scope_id = (SELECT state_id FROM cities WHERE id = (SELECT city_id FROM pincodes WHERE id = NEW.scope_id::UUID))
      AND is_enabled = false
    ) THEN
      RAISE EXCEPTION 'Cannot enable PINCODE when parent STATE is disabled';
    END IF;
  END IF;

  IF NEW.scope_type = 'CITY' AND NEW.is_enabled = true THEN
    -- Check if parent STATE disabled
    IF EXISTS (
      SELECT 1 FROM service_availability
      WHERE service_id = NEW.service_id
      AND scope_type = 'STATE'
      AND scope_id = (SELECT state_id FROM cities WHERE id = NEW.scope_id::UUID)
      AND is_enabled = false
    ) THEN
      RAISE EXCEPTION 'Cannot enable CITY when parent STATE is disabled';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_parent_availability
BEFORE INSERT OR UPDATE ON service_availability
FOR EACH ROW
EXECUTE FUNCTION check_parent_availability();
```

---

#### Task 2.6: Create Admin APIs (Cloudflare Workers)
**Expected Code:**

```javascript
// worker.js - /admin/service-availability endpoints

// POST /admin/service-availability/create
export async function createServiceAvailability(request) {
  const { service_id, scope_type, scope_id, is_enabled } = await request.json();
  
  // Validate parent rules
  const parentRule = await checkParentRules(service_id, scope_type, scope_id, is_enabled);
  if (!parentRule.allowed) {
    return new Response(JSON.stringify({ error: parentRule.reason }), { status: 400 });
  }

  // Insert rule
  const result = await supabase
    .from('service_availability')
    .insert([{ service_id, scope_type, scope_id, is_enabled, priority: getPriority(scope_type) }]);

  return new Response(JSON.stringify(result), { status: 201 });
}

// GET /admin/service-availability/tree?service=PLUMBING
export async function getServiceTree(request) {
  const url = new URL(request.url);
  const service = url.searchParams.get('service');

  const serviceId = await getServiceId(service);
  const rules = await supabase
    .from('service_availability')
    .select('*')
    .eq('service_id', serviceId)
    .order('scope_type', { ascending: true });

  // Build hierarchical response
  return new Response(JSON.stringify(buildTree(rules)), { status: 200 });
}
```

---

#### Task 2.7: Create Public Check Endpoint
**Expected Code:**

```javascript
// worker.js - /availability/check endpoint

export async function checkAvailability(request) {
  const url = new URL(request.url);
  const service = url.searchParams.get('service');
  const pincode = url.searchParams.get('pincode');

  // Check cache first
  const cacheKey = `service:${service}:pincode:${pincode}`;
  const cached = await CACHE.get(cacheKey);
  if (cached) return new Response(cached, { status: 200 });

  // Query RPC
  const result = await supabase.rpc('resolve_service_availability', {
    p_service_code: service,
    p_pincode: pincode
  });

  const response = {
    service: result.service_code,
    pincode: result.pincode,
    is_enabled: result.is_enabled,
    resolved_from: result.resolved_scope,
    scope_name: result.scope_name
  };

  // Cache result (TTL: 10 minutes)
  await CACHE.put(cacheKey, JSON.stringify(response), { expirationTtl: 600 });

  return new Response(JSON.stringify(response), { status: 200 });
}
```

---

#### Task 2.8: Test Cases (20+ required)
**Test Suite:**
```sql
-- 006_test_availability_logic.sql

-- Test 1: State DISABLED → Everything disabled
INSERT INTO service_availability VALUES (gen_random_uuid(), :plumbing_id, 'STATE', :ap_state_id, false, 1);
SELECT resolve_service_availability('PLUMBING', '500016');
-- Expected: is_enabled = false, resolved_scope = 'STATE'

-- Test 2: City DISABLED under enabled state → Pincodes disabled
INSERT INTO service_availability VALUES (gen_random_uuid(), :plumbing_id, 'CITY', :hyderabad_city_id, false, 2);
SELECT resolve_service_availability('PLUMBING', '500041');
-- Expected: is_enabled = false, resolved_scope = 'CITY'

-- Test 3: Pincode ENABLED overrides City DISABLED
INSERT INTO service_availability VALUES (gen_random_uuid(), :plumbing_id, 'PINCODE', :p500001_id, true, 3);
SELECT resolve_service_availability('PLUMBING', '500001');
-- Expected: is_enabled = true, resolved_scope = 'PINCODE'

-- Test 4: No rules → Global flag honored
SELECT resolve_service_availability('ELECTRICAL', '400001');
-- Expected: is_enabled = true (global default), resolved_scope = 'GLOBAL'

-- Test 5: Write guard: Reject PINCODE enable if CITY disabled
BEGIN;
INSERT INTO service_availability VALUES (..., 'CITY', ..., false, 2);
INSERT INTO service_availability VALUES (..., 'PINCODE', ..., true, 3);
-- Expected: EXCEPTION - Cannot enable PINCODE when parent CITY disabled
ROLLBACK;

-- [15+ more edge cases]
```

---

### ✅ Sprint 2 Output

```
✅ services table created + seeded (10+ initial services)
✅ service_availability table + indexes
✅ Availability resolution RPC (resolve_service_availability)
✅ Write guards (parent validation triggers)
✅ Admin APIs: CREATE/READ rules
✅ Public API: /availability/check with caching
✅ 20+ test cases passing
✅ Cache invalidation logic working
✅ Ready for Sprint 3 (Admin UI)
```

---

## 🚀 EXECUTION SEQUENCE

**For Antigravity:**

1. **Pre-Flight (5 min):**
   - [ ] Backup current Supabase DB
   - [ ] Clone thelokals monorepo (apps/web-client, mobile-provider, web-admin ready)
   - [ ] Verify Supabase connection

2. **Sprint 1 (Days 1-5):**
   - [ ] Execute migrations 001-003 sequentially
   - [ ] Run validation queries
   - [ ] Confirm 27 states, 464 cities, 20,930 pincodes

3. **Sprint 2 (Days 6-10):**
   - [ ] Execute migrations 004-006
   - [ ] Deploy Worker code (test endpoints)
   - [ ] Run 20+ test suite
   - [ ] Verify /availability/check responds <100ms

4. **Post-Deploy (Days 11+):**
   - [ ] Test all 5 apps build/run
   - [ ] Smoke test: Web client can query services
   - [ ] Admin can create rules + see tree view
   - [ ] Feature flag toggle (optional)

---

## 📍 SUPPORT FILES

- `lokals_pincode_hierarchy_clean.csv` - Bulk pincodes
- `lokals_geo_hierarchy.json` - Reference hierarchy
- `lokals_service_coverage.json` - Service reach
- `antigravity_sprint1_data_ref.md` - Data validation guide

---

## ✋ PAUSE POINTS (For Approval)

- [ ] After Sprint 1: Geo data seeded → PAUSE for data verification
- [ ] After RPC creation: Test availability resolution → PAUSE for logic review
- [ ] After Worker deployment: Cache behavior tested → PAUSE for performance review
- [ ] Before prod: All 5 apps pass tests → PAUSE for final approval

---

**Ready to proceed? Share these files + this prompt with Antigravity. Execution time: ~10 days total.** 🚀
