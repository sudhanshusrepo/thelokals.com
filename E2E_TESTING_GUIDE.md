# E2E Testing Guide - Best Practices

## Table of Contents
1. [Overview](#overview)
2. [Test Structure](#test-structure)
3. [Best Practices](#best-practices)
4. [Running Tests](#running-tests)
5. [Writing New Tests](#writing-new-tests)
6. [Debugging](#debugging)
7. [CI/CD Integration](#cicd-integration)

---

## Overview

Our E2E testing suite uses **Playwright** with TypeScript and follows industry best practices for maintainable, reliable, and fast tests.

### Test Coverage

- **Functional Tests**: User flows, booking system, authentication
- **Accessibility Tests**: WCAG 2.1 AA compliance
- **Integration Tests**: API endpoints, data validation
- **Performance Tests**: Load times, resource usage
- **Visual Tests**: Screenshot comparisons

### Key Principles

1. **Page Object Model (POM)**: Encapsulate page interactions
2. **Test Fixtures**: Reusable test data and utilities
3. **Independent Tests**: Each test can run in isolation
4. **Fast Feedback**: Parallel execution, smart retries
5. **Maintainability**: Clear naming, good documentation

---

## Test Structure

```
tests/
├── fixtures/
│   └── test-fixtures.ts          # Reusable fixtures and helpers
├── page-objects/
│   └── pages.ts                   # Page Object Models
├── e2e/
│   ├── functional/                # User flow tests
│   │   ├── auth-enhanced.spec.ts
│   │   ├── booking-enhanced.spec.ts
│   │   └── user-experience.spec.ts
│   ├── accessibility/             # A11y tests
│   │   ├── homepage.spec.ts
│   │   └── booking-flow.spec.ts
│   ├── integration/               # API tests
│   │   └── api-integration.spec.ts
│   └── performance/               # Performance tests
│       └── load-time.spec.ts
```

---

## Best Practices

### 1. Use Page Object Model

**❌ Bad:**
```typescript
test('should login', async ({ page }) => {
  await page.goto('/');
  await page.click('button:has-text("Sign In")');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');
});
```

**✅ Good:**
```typescript
test('should login', async ({ page }) => {
  const homePage = new HomePage(page);
  const authPage = new AuthPage(page);
  
  await homePage.goto();
  await homePage.clickSignIn();
  await authPage.login('test@example.com', 'password');
});
```

### 2. Use Test Fixtures

**❌ Bad:**
```typescript
test('should create booking', async ({ page }) => {
  const email = 'test@example.com';
  const category = 'Plumber';
  const description = 'Fix sink';
  // ... repetitive setup
});
```

**✅ Good:**
```typescript
test('should create booking', async ({ page, testUser, testBooking }) => {
  // testUser and testBooking are fixtures with random data
  await serviceRequestPage.fillServiceRequest(testBooking);
});
```

### 3. Wait for Elements Properly

**❌ Bad:**
```typescript
await page.waitForTimeout(5000); // Arbitrary wait
```

**✅ Good:**
```typescript
await expect(page.locator('.result')).toBeVisible({ timeout: 5000 });
await page.waitForLoadState('networkidle');
```

### 4. Use Semantic Selectors

**❌ Bad:**
```typescript
await page.click('.btn-primary.mt-4.px-6');
```

**✅ Good:**
```typescript
await page.getByRole('button', { name: 'Submit' }).click();
await page.locator('[data-testid="submit-button"]').click();
```

### 5. Handle Flaky Tests

**❌ Bad:**
```typescript
test('flaky test', async ({ page }) => {
  await page.click('.dynamic-element'); // Might not exist yet
});
```

**✅ Good:**
```typescript
test('stable test', async ({ page }) => {
  await page.waitForSelector('.dynamic-element', { state: 'visible' });
  await page.click('.dynamic-element');
});
```

### 6. Test Independence

**❌ Bad:**
```typescript
test.describe('Dependent tests', () => {
  let bookingId: string;
  
  test('create booking', async () => {
    bookingId = await createBooking(); // Other tests depend on this
  });
  
  test('view booking', async () => {
    await viewBooking(bookingId); // Fails if previous test fails
  });
});
```

**✅ Good:**
```typescript
test.describe('Independent tests', () => {
  test('create booking', async () => {
    const bookingId = await createBooking();
    // Test completes independently
  });
  
  test('view booking', async () => {
    const bookingId = await createTestBooking(); // Setup in this test
    await viewBooking(bookingId);
  });
});
```

### 7. Use Descriptive Test Names

**❌ Bad:**
```typescript
test('test 1', async ({ page }) => { ... });
test('booking', async ({ page }) => { ... });
```

**✅ Good:**
```typescript
test('should create AI-enhanced booking with valid requirements', async ({ page }) => { ... });
test('should show error when booking creation fails', async ({ page }) => { ... });
```

### 8. Group Related Tests

```typescript
test.describe('Authentication', () => {
  test.describe('Sign In', () => {
    test('should login with valid credentials', async () => { ... });
    test('should show error with invalid credentials', async () => { ... });
  });
  
  test.describe('Sign Up', () => {
    test('should register new user', async () => { ... });
    test('should prevent duplicate registration', async () => { ... });
  });
});
```

### 9. Mock External Dependencies

```typescript
test('should handle API failure', async ({ page }) => {
  // Mock API to return error
  await page.route('**/api/bookings', route => {
    route.fulfill({
      status: 500,
      body: JSON.stringify({ error: 'Server error' })
    });
  });
  
  // Test error handling
  await createBooking();
  await expect(page.locator('.error-message')).toBeVisible();
});
```

### 10. Clean Up After Tests

```typescript
test('should create and delete resource', async ({ page }) => {
  const resourceId = await createResource();
  
  try {
    // Test logic
    await verifyResource(resourceId);
  } finally {
    // Cleanup
    await deleteResource(resourceId);
  }
});
```

---

## Running Tests

### All Tests
```bash
npm run test:e2e
```

### Specific Test File
```bash
npm run test:e2e tests/e2e/functional/auth-enhanced.spec.ts
```

### With UI Mode (Recommended for Development)
```bash
npm run test:e2e:ui
```

### Headed Mode (See Browser)
```bash
npx playwright test --headed
```

### Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Debug Mode
```bash
npx playwright test --debug
```

### Generate Report
```bash
npx playwright show-report
```

### Update Snapshots
```bash
npx playwright test --update-snapshots
```

---

## Writing New Tests

### 1. Create Test File

```typescript
import { test, expect } from '../fixtures/test-fixtures';
import { HomePage } from '../page-objects/pages';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
  });

  test('should do something', async ({ page }) => {
    // Test logic
  });
});
```

### 2. Add Page Object (if needed)

```typescript
// tests/page-objects/pages.ts
export class NewPage {
  readonly page: Page;
  readonly element: Locator;

  constructor(page: Page) {
    this.page = page;
    this.element = page.locator('.element');
  }

  async doAction() {
    await this.element.click();
  }
}
```

### 3. Add Test Fixture (if needed)

```typescript
// tests/fixtures/test-fixtures.ts
export const test = base.extend<{
  newFixture: NewType;
}>({
  newFixture: async ({}, use) => {
    const data = generateTestData();
    await use(data);
  },
});
```

---

## Debugging

### 1. Use Playwright Inspector

```bash
npx playwright test --debug
```

### 2. Add Breakpoints

```typescript
test('debug test', async ({ page }) => {
  await page.goto('/');
  await page.pause(); // Pauses execution
  await page.click('button');
});
```

### 3. Take Screenshots

```typescript
test('screenshot test', async ({ page }) => {
  await page.screenshot({ path: 'screenshot.png' });
  await page.screenshot({ path: 'fullpage.png', fullPage: true });
});
```

### 4. Console Logs

```typescript
test('log test', async ({ page }) => {
  page.on('console', msg => console.log(msg.text()));
  await page.goto('/');
});
```

### 5. Trace Viewer

```typescript
// playwright.config.ts
use: {
  trace: 'on-first-retry',
}
```

View traces:
```bash
npx playwright show-trace trace.zip
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### Environment Variables

```bash
# .env.test
VITE_API_URL=https://test-api.example.com
VITE_SUPABASE_URL=https://test.supabase.co
VITE_SUPABASE_ANON_KEY=test-key
```

---

## Test Metrics

### Coverage Goals

- **Critical Paths**: 100% coverage
- **User Flows**: 90% coverage
- **Edge Cases**: 70% coverage
- **Accessibility**: WCAG 2.1 AA compliance

### Performance Benchmarks

- Page load: < 3 seconds
- API response: < 500ms
- Test execution: < 5 minutes (full suite)

---

## Common Issues and Solutions

### Issue: Tests are flaky

**Solution:**
- Use `waitForSelector` instead of `waitForTimeout`
- Increase timeout for slow operations
- Use `test.retry(2)` for flaky tests
- Mock external dependencies

### Issue: Tests are slow

**Solution:**
- Run tests in parallel
- Use `test.describe.configure({ mode: 'parallel' })`
- Mock API calls
- Use smaller test data sets

### Issue: Selectors break frequently

**Solution:**
- Use `data-testid` attributes
- Use semantic selectors (role, label)
- Avoid CSS class selectors
- Document selector strategy

---

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Accessibility Testing](https://playwright.dev/docs/accessibility-testing)

---

## Contributing

When adding new tests:

1. Follow the existing structure
2. Use Page Object Model
3. Add descriptive test names
4. Include comments for complex logic
5. Update this guide if needed
6. Run tests locally before committing

---

**Last Updated**: 2025-11-29
