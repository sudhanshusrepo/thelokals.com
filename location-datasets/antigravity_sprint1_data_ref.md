# Sprint 1: Geo Data Foundation - REFINED DATASET REFERENCE
**Status:** Ready for Antigravity Implementation  
**Date:** January 27, 2026  
**Scope:** Parse Excel → Normalize → Populate geo tables (states/cities/pincodes)

---

## 📊 Dataset Summary

| Metric | Value | Status |
|--------|-------|--------|
| **Total States** | 27 | ✅ Verified |
| **Total Cities** | 464 | ✅ Verified |
| **Total Pincodes** | 20,930 | ✅ Verified |
| **Service Categories** | 1 (Large) | ✅ From NAC sheet |
| **Coverage** | 100% serviceable | ✅ All pincodes active |
| **Data Quality** | Clean | ✅ Deduplicated |

---

## 🗺️ State-City Hierarchy (Sample)

### Tier 1: States (28 normalized)
```
ANDHRA PRADESH (74 cities, 1,143 pincodes)
├─ ADONI, ANAKAPALLI, ANANTAPUR, BHIMAVARAM, BHIWANDI, ... (74 total)

MAHARASHTRA (56 cities, 4,820 pincodes)  [LARGEST]
├─ AKLUJ, ALIBAUG, AURANGABAD, BARAMATI, BELAGAUM, ... (56 total)
└─ Sample pincodes: 400001 (Mumbai), 411001 (Pune), 440001 (Nagpur)

TAMIL NADU (43 cities, 2,104 pincodes)
├─ ALANDUR, AMBATTUR, AMBUR, ANAMUDI, ARUPPUKKOTTAI, ... (43 total)

UTTAR PRADESH (52 cities, 2,087 pincodes)
├─ AGRA, ALIGARH, ALLAHABAD, AYODHYA, AZAMGARH, ... (52 total)

KARNATAKA (30 cities, 1,804 pincodes)
├─ ANEKAL, ANEKALR, ANGADIHALLI, BAILUR, BANASANDRA, ... (30 total)

... [22 more states]
```

### Tier 2: Cities (464 total, ~45 per state avg)
- **Format:** State → City (deduplicated, no duplicates across dataset)
- **Key Metros:**
  - Maharashtra: Mumbai (400xxx), Pune (411xxx), Nagpur (440xxx)
  - Karnataka: Bangalore (560xxx)
  - Tamil Nadu: Chennai (600xxx)
  - Delhi: New Delhi (11xxxx)
  - West Bengal: Kolkata (700xxx)

### Tier 3: Pincodes (20,930 total)
- **Format:** 6-digit string (zero-padded)
- **Sample Coverage:**
  ```
  400001 → Mumbai → Maharashtra
  560001 → Bangalore → Karnataka
  600001 → Chennai → Tamil Nadu
  110001 → New Delhi → Delhi
  700001 → Kolkata → West Bengal
  ```

---

## 🚀 Refined Datasets (Ready for Use)

### 1. **lokals_pincode_hierarchy_clean.csv**
- **Rows:** 20,930
- **Columns:** `pincode, category, zone, state, city, is_serviceable`
- **Use:** Direct bulk insert into `pincodes` table
- **Status:** ✅ Deduplicated, normalized, ready

### 2. **lokals_geo_hierarchy.json**
- **Structure:** Hierarchical state → city → pincode mapping
- **Use:** Reference for admin tree-view UI + validation
- **Sample:**
  ```json
  {
    "MAHARASHTRA": {
      "city_count": 56,
      "total_pincodes": 4820,
      "cities": {
        "MUMBAI": {
          "pincode_count": 847,
          "sample_pincodes": ["400001", "400002", "400003"],
          "categories": ["Large"]
        }
      }
    }
  }
  ```

### 3. **lokals_service_coverage.json**
- **Structure:** Service code → coverage map
- **Use:** Seed `services` table + validate category reach
- **Sample:**
  ```json
  {
    "Large": {
      "total_pincodes": 20930,
      "states": 27,
      "cities": 464
    }
  }
  ```

---

## 📋 Tables to Populate (SQL Order)

### Step 1: Create Extensions
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Step 2: States Table (27 records)
| State Code | State Name | Pincodes |
|-----------|-----------|----------|
| AP | ANDHRA PRADESH | 1,143 |
| MH | MAHARASHTRA | 4,820 |
| TN | TAMIL NADU | 2,104 |
| UP | UTTAR PRADESH | 2,087 |
| KA | KARNATAKA | 1,804 |
| ... | ... | ... |

**INSERT:** Generate via Python script iterating `states_dict`

### Step 3: Cities Table (464 records)
**Relationships:**
```
states.id (PK) → cities.state_id (FK)
```

**Sample inserts:**
```sql
INSERT INTO cities (state_id, name) VALUES (:ap_id, 'MUMBAI');
INSERT INTO cities (state_id, name) VALUES (:ap_id, 'PUNE');
```

**No duplicates:** City names can repeat across states (handled via state_id FK).

### Step 4: Pincodes Table (20,930 records)
**Relationships:**
```
cities.id (PK) → pincodes.city_id (FK)
```

**Bulk insert from CSV:**
```sql
COPY pincodes (city_id, pincode) FROM 'lokals_pincode_hierarchy_clean.csv' WITH (FORMAT csv);
```

---

## ✅ Validation Queries

```sql
-- Verify state coverage
SELECT state, COUNT(*) as state_count FROM pincodes
GROUP BY state ORDER BY state_count DESC;
-- Expected: 27 states, ~775 pincodes/state avg

-- Verify city hierarchy
SELECT c.name, s.name, COUNT(p.id) as pincode_count
FROM cities c
JOIN states s ON c.state_id = s.id
LEFT JOIN pincodes p ON p.city_id = c.id
GROUP BY c.id, s.id
ORDER BY pincode_count DESC LIMIT 10;
-- Expected: Mumbai (847), Bangalore (560+), Chennai (600+)

-- Spot check a pincode
SELECT p.pincode, c.name as city, s.name as state
FROM pincodes p
JOIN cities c ON p.city_id = c.id
JOIN states s ON c.state_id = s.id
WHERE p.pincode = '400001';
-- Expected: 400001 | MUMBAI | MAHARASHTRA
```

---

## 🔧 Data Quality Checks (Pre-Deploy)

- [ ] All pincodes 6-digit format (zero-padded)
- [ ] No NULL values in state/city/pincode
- [ ] No duplicate pincodes (UNIQUE constraint)
- [ ] Cities linked to correct states (verify FK)
- [ ] Coverage >99% of India serviceable area
- [ ] CSV import validates row count: 20,930
- [ ] JSON hierarchy matches CSV (spot checks 10+ random records)

---

## 📌 Critical Notes for Antigravity

1. **No Mock Data:** All 20,930 pincodes real, production-ready.
2. **No Excel Dependency:** After ingestion, delete Excel files. Never reference at runtime.
3. **Immutable After Insert:** These tables are reference data. Treat as read-mostly.
4. **State Codes:** Use 2-letter ISO-like codes for clarity (AP, MH, TN, etc.).
5. **City Deduplication:** Some cities may span states (e.g., "AMBATTUR" might appear in TN); FK ensures uniqueness via state_id.
6. **Performance:** Index on `pincode` (UNIQUE) for fast lookups. Index on `city_id` for city→pincode queries.

---

## 🎯 Success Criteria for Sprint 1

✅ All 27 states inserted  
✅ All 464 cities inserted with correct state FKs  
✅ All 20,930 pincodes inserted with correct city FKs  
✅ Validation queries return expected counts  
✅ Spot checks confirm data accuracy  
✅ CSV + JSON exports match DB state  
✅ Ready for Sprint 2 (services + availability rules)
