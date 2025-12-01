# Bug Tracking Template

## How to Use This Template

1. Copy this template for each bug
2. Fill in all required fields
3. Save in `docs/reports/bugs/` with format: `BUG-XXX-short-title.md`
4. Link to the bug from relevant documentation

---

## Bug ID: BUG-XXX

**Title**: [Clear, concise title]

**Priority**: P0 / P1 / P2 / P3

**Package**: client / app / provider / admin / core

**Component**: [Specific component or service name]

**Discovered**: [YYYY-MM-DD]

**Discovered By**: [Name or automated test]

**Status**: Open / In Progress / Fixed / Verified / Closed

**Assigned To**: [Developer name]

---

## Description

[Clear, detailed description of the bug. Include what the user was trying to do and what went wrong.]

---

## Steps to Reproduce

1. [First step]
2. [Second step]
3. [Third step]
4. [Continue...]

---

## Expected Behavior

[Describe what should happen]

---

## Actual Behavior

[Describe what actually happens]

---

## Screenshots/Videos

[Attach or link to screenshots/videos if applicable]

---

## Environment

**Browser/Device**: [e.g., Chrome 120, iPhone 14 Pro]
**OS**: [e.g., Windows 11, iOS 17]
**App Version**: [e.g., 1.0.0]
**Network**: [e.g., WiFi, 4G, Slow 3G]

---

## Console Errors

```
[Paste any console errors here]
```

---

## Network Requests

```
[Paste relevant failed network requests]
```

---

## Root Cause Analysis

### Investigation

[Describe the investigation process]

### Root Cause

[Explain why this bug occurred]

### Related Code

```typescript
// Paste relevant code snippets
```

**File**: `path/to/file.ts`
**Lines**: XX-YY

---

## Fix

### Solution

[Describe the fix implemented]

### Code Changes

```typescript
// Before
[old code]

// After
[new code]
```

**Files Changed**:
- `path/to/file1.ts`
- `path/to/file2.ts`

**Pull Request**: #XXX

---

## Test Coverage

### Unit Tests Added

- [ ] Test case 1
- [ ] Test case 2

### Integration Tests Added

- [ ] Test case 1
- [ ] Test case 2

### E2E Tests Added

- [ ] Test case 1
- [ ] Test case 2

---

## Regression Prevention

[Explain how this bug will be prevented in the future]

---

## Related Issues

- Related to: BUG-XXX
- Blocks: BUG-XXX
- Blocked by: BUG-XXX

---

## Timeline

- **Discovered**: [Date]
- **Assigned**: [Date]
- **Started**: [Date]
- **Fixed**: [Date]
- **Verified**: [Date]
- **Closed**: [Date]

---

## Notes

[Any additional notes or context]

---

## Checklist

- [ ] Bug reproduced
- [ ] Root cause identified
- [ ] Fix implemented
- [ ] Tests added
- [ ] Code reviewed
- [ ] QA verified
- [ ] Documentation updated
- [ ] Deployed to production
