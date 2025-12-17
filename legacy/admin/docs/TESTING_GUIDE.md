# Admin Panel - Testing Guide

## Test Coverage Overview

This document outlines the testing strategy for the Admin Panel, including unit tests, integration tests, and end-to-end tests.

---

## 1. Unit Tests

### Authentication Tests

**File**: `src/contexts/AuthContext.test.tsx`

```typescript
describe('AuthContext', () => {
  test('should sign in with email/password', async () => {
    // Test email/password authentication
  });

  test('should handle Google OAuth flow', async () => {
    // Test Google sign-in
  });

  test('should load admin user after authentication', async () => {
    // Test admin user loading
  });

  test('should reject non-admin users', async () => {
    // Test unauthorized access
  });

  test('should sign out successfully', async () => {
    // Test sign out
  });
});
```

### Admin Service Tests

**File**: `core/services/adminService.test.ts`

```typescript
describe('adminService', () => {
  describe('getServiceAvailability', () => {
    test('should fetch all service availability', async () => {
      // Test fetching all records
    });

    test('should filter by city', async () => {
      // Test city filter
    });

    test('should filter by status', async () => {
      // Test status filter
    });
  });

  describe('toggleServiceAvailability', () => {
    test('should enable a service', async () => {
      // Test enabling service
    });

    test('should disable a service with reason', async () => {
      // Test disabling with reason
    });

    test('should log the action', async () => {
      // Verify audit log entry
    });
  });

  describe('bulkToggleServices', () => {
    test('should toggle multiple services', async () => {
      // Test bulk operation
    });

    test('should create audit log for bulk action', async () => {
      // Verify bulk audit log
    });
  });

  describe('getActiveSessions', () => {
    test('should fetch sessions from last 5 minutes', async () => {
      // Test time filter
    });

    test('should filter by city and user type', async () => {
      // Test filters
    });
  });
});
```

### Booking Service Tests

**File**: `core/services/bookingService.test.ts`

```typescript
describe('bookingService', () => {
  describe('checkServiceAvailability', () => {
    test('should return true when service is enabled', async () => {
      // Mock enabled service
      const result = await bookingService.checkServiceAvailability('service-1', 'Mumbai');
      expect(result).toBe(true);
    });

    test('should return false when service is disabled', async () => {
      // Mock disabled service
      const result = await bookingService.checkServiceAvailability('service-1', 'Mumbai');
      expect(result).toBe(false);
    });

    test('should return true when no record exists', async () => {
      // Test default behavior
      const result = await bookingService.checkServiceAvailability('new-service', 'Delhi');
      expect(result).toBe(true);
    });
  });

  describe('createAIBooking', () => {
    test('should block booking when service is disabled', async () => {
      // Test availability check integration
      await expect(
        bookingService.createAIBooking({
          serviceCategory: 'disabled-service',
          address: { city: 'Mumbai' },
          // ... other params
        })
      ).rejects.toThrow('currently unavailable');
    });

    test('should create booking when service is available', async () => {
      // Test successful booking
    });
  });
});
```

---

## 2. Integration Tests

### Service Control Flow

**File**: `tests/integration/serviceControl.test.ts`

```typescript
describe('Service Control Integration', () => {
  let adminUser: AdminUser;
  let testCity = 'TestCity';
  let testService = 'test-service-id';

  beforeAll(async () => {
    // Set up test admin user
    adminUser = await createTestAdmin('ops_admin');
  });

  test('should disable service and block bookings', async () => {
    // 1. Disable service
    await adminService.toggleServiceAvailability(
      testService,
      testCity,
      'DISABLED',
      adminUser.id,
      'Integration test'
    );

    // 2. Verify service is disabled
    const availability = await adminService.getServiceAvailability({ city: testCity });
    const record = availability.find(a => a.service_category_id === testService);
    expect(record?.status).toBe('DISABLED');

    // 3. Try to create booking
    await expect(
      bookingService.createAIBooking({
        serviceCategory: testService,
        address: { city: testCity },
        // ... other params
      })
    ).rejects.toThrow();

    // 4. Verify audit log
    const logs = await adminService.getAuditLogs({ adminId: adminUser.id });
    expect(logs[0].action).toBe('disabled_service');
  });

  test('should re-enable service and allow bookings', async () => {
    // 1. Enable service
    await adminService.toggleServiceAvailability(
      testService,
      testCity,
      'ENABLED',
      adminUser.id
    );

    // 2. Verify booking succeeds
    const result = await bookingService.createAIBooking({
      serviceCategory: testService,
      address: { city: testCity },
      // ... other params
    });
    expect(result.bookingId).toBeDefined();
  });

  afterAll(async () => {
    // Clean up test data
  });
});
```

### WebSocket Real-Time Updates

**File**: `tests/integration/websocket.test.ts`

```typescript
describe('WebSocket Real-Time Updates', () => {
  test('should receive session updates in real-time', async (done) => {
    // 1. Subscribe to active sessions
    const channel = adminService.subscribeToActiveSessions((payload) => {
      expect(payload.eventType).toBe('INSERT');
      expect(payload.new).toHaveProperty('user_id');
      done();
    });

    // 2. Create a new session
    await createTestSession();

    // 3. Cleanup
    channel.unsubscribe();
  });

  test('should receive booking updates in real-time', async (done) => {
    // Similar test for booking updates
  });
});
```

---

## 3. End-to-End Tests

### Admin Login Flow

**File**: `tests/e2e/login.spec.ts` (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Admin Login', () => {
  test('should login with email/password', async ({ page }) => {
    await page.goto('https://admin.thelokals.com/login');
    
    await page.fill('input[type="email"]', 'admin@thelokals.com');
    await page.fill('input[type="password"]', 'test-password');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('https://admin.thelokals.com/');
    await expect(page.locator('h1')).toContainText('Admin Panel');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('https://admin.thelokals.com/login');
    
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrong-password');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.error')).toBeVisible();
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('https://admin.thelokals.com/live-users');
    await expect(page).toHaveURL(/.*login/);
  });
});
```

### Service Control E2E

**File**: `tests/e2e/serviceControl.spec.ts`

```typescript
test.describe('Service Control', () => {
  test.beforeEach(async ({ page }) => {
    // Login as ops_admin
    await loginAsAdmin(page, 'ops_admin');
  });

  test('should toggle service status', async ({ page }) => {
    await page.goto('https://admin.thelokals.com/service-control');
    
    // Select city
    await page.selectOption('select', 'Mumbai');
    
    // Find a service card
    const serviceCard = page.locator('.service-card').first();
    const initialStatus = await serviceCard.locator('button').textContent();
    
    // Click to toggle
    await serviceCard.locator('button').click();
    
    // If disabling, enter reason
    if (initialStatus === 'ENABLED') {
      await page.fill('input[type="text"]', 'E2E test disable');
      await page.click('button:has-text("OK")');
    }
    
    // Verify status changed
    await expect(serviceCard.locator('button')).not.toContainText(initialStatus);
  });

  test('should perform bulk disable', async ({ page }) => {
    await page.goto('https://admin.thelokals.com/service-control');
    await page.selectOption('select', 'Mumbai');
    
    await page.click('button:has-text("Disable All Local Services")');
    await page.fill('input[type="text"]', 'Bulk disable test');
    await page.click('button:has-text("OK")');
    
    // Verify all local services are disabled
    const localServices = page.locator('.service-card:has-text("local")');
    const count = await localServices.count();
    
    for (let i = 0; i < count; i++) {
      await expect(localServices.nth(i).locator('button')).toContainText('DISABLED');
    }
  });
});
```

### Live Monitoring E2E

**File**: `tests/e2e/liveMonitoring.spec.ts`

```typescript
test.describe('Live Monitoring', () => {
  test('should display active users', async ({ page }) => {
    await loginAsAdmin(page, 'read_only');
    await page.goto('https://admin.thelokals.com/live-users');
    
    // Verify summary cards
    await expect(page.locator('text=Active Customers')).toBeVisible();
    await expect(page.locator('text=Active Providers')).toBeVisible();
    
    // Verify table
    await expect(page.locator('table')).toBeVisible();
  });

  test('should filter users by city', async ({ page }) => {
    await loginAsAdmin(page, 'read_only');
    await page.goto('https://admin.thelokals.com/live-users');
    
    await page.fill('input[placeholder*="city"]', 'Mumbai');
    await page.click('button:has-text("Refresh")');
    
    // Verify filtered results
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText('Mumbai');
    }
  });

  test('should display active jobs', async ({ page }) => {
    await loginAsAdmin(page, 'read_only');
    await page.goto('https://admin.thelokals.com/live-jobs');
    
    // Verify summary cards
    await expect(page.locator('text=Total Active')).toBeVisible();
    await expect(page.locator('text=Pending')).toBeVisible();
    
    // Verify table
    await expect(page.locator('table')).toBeVisible();
  });
});
```

---

## 4. Performance Tests

### Load Testing

**File**: `tests/performance/load.test.ts`

```typescript
import { check } from 'k6';
import http from 'k6/http';

export const options = {
  stages: [
    { duration: '1m', target: 10 },  // Ramp up to 10 users
    { duration: '3m', target: 10 },  // Stay at 10 users
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
  },
};

export default function () {
  // Test dashboard load time
  const dashboardRes = http.get('https://admin.thelokals.com/api/dashboard');
  check(dashboardRes, {
    'dashboard loads in <2s': (r) => r.timings.duration < 2000,
  });

  // Test service availability query
  const availabilityRes = http.get('https://admin.thelokals.com/api/service-availability');
  check(availabilityRes, {
    'availability query <500ms': (r) => r.timings.duration < 500,
  });
}
```

---

## 5. Running Tests

### Unit Tests
```bash
# Run all unit tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Integration Tests
```bash
# Run integration tests
npm run test:integration

# Run specific test file
npm run test:integration -- serviceControl.test.ts
```

### E2E Tests
```bash
# Run all E2E tests
npx playwright test

# Run in headed mode (see browser)
npx playwright test --headed

# Run specific test
npx playwright test login.spec.ts

# Debug mode
npx playwright test --debug
```

### Performance Tests
```bash
# Run load test
k6 run tests/performance/load.test.ts

# Run with custom VUs
k6 run --vus 50 --duration 5m tests/performance/load.test.ts
```

---

## 6. Test Coverage Goals

| Component | Target Coverage |
|-----------|----------------|
| Services | 90% |
| Components | 80% |
| Utils | 95% |
| Integration | 70% |
| E2E | Critical paths |

---

## 7. Continuous Integration

### GitHub Actions Workflow

```yaml
name: Admin Panel Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test -- --coverage
      - run: npx playwright install
      - run: npx playwright test
```

---

## Next Steps

1. ✅ Implement unit tests for core services
2. ✅ Add integration tests for service control flow
3. ✅ Create E2E tests for critical user journeys
4. ✅ Set up CI/CD pipeline
5. ✅ Monitor test coverage and improve
