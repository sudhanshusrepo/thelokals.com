# E2E Testing Quick Reference

## 🚀 Quick Start

```bash
# Run all tests
npm run test:e2e

# Run with UI (recommended for development)
npm run test:e2e:ui

# Debug a specific test
npx playwright test --debug tests/e2e/functional/auth-enhanced.spec.ts
```

---

## 📁 Test File Locations

| Category | Path | Test Count |
|----------|------|------------|
| **Authentication** | `tests/e2e/functional/auth-enhanced.spec.ts` | 15+ |
| **Booking Flow** | `tests/e2e/functional/booking-enhanced.spec.ts` | 25+ |
| **User Experience** | `tests/e2e/functional/user-experience.spec.ts` | 30+ |
| **Accessibility** | `tests/e2e/accessibility/*.spec.ts` | 11 |
| **API Integration** | `tests/e2e/integration/api-integration.spec.ts` | 30+ |
| **Page Objects** | `tests/page-objects/pages.ts` | 5 POMs |
| **Fixtures** | `tests/fixtures/test-fixtures.ts` | Helpers |

---

## 🎯 Common Commands

### Run Tests

```bash
# All tests
npm run test:e2e

# Specific file
npx playwright test tests/e2e/functional/auth-enhanced.spec.ts

# Specific test
npx playwright test -g "should login with valid credentials"

# Specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Mobile
npx playwright test --project=mobile-chrome
npx playwright test --project=mobile-safari

# Accessibility only
npx playwright test --project=accessibility

# API tests only
npx playwright test --project=api
```

### Debug & Inspect

```bash
# UI Mode (visual debugging)
npm run test:e2e:ui

# Debug mode (step through)
npx playwright test --debug

# Headed mode (see browser)
npx playwright test --headed

# Show report
npx playwright show-report

# Show trace
npx playwright show-trace trace.zip
```

### Update & Maintain

```bash
# Update snapshots
npx playwright test --update-snapshots

# Install browsers
npx playwright install

# Install with dependencies
npx playwright install --with-deps

# Check version
npx playwright --version
```

---

## 📝 Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '../fixtures/test-fixtures';
import { HomePage } from '../page-objects/pages';

test.describe('Feature Name', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await homePage.clickSignIn();
    
    // Act
    await authPage.login('test@example.com', 'password');
    
    // Assert
    await expect(page).toHaveURL('/dashboard');
  });
});
```

### Using Fixtures

```typescript
test('should create booking', async ({ page, testBooking }) => {
  // testBooking is auto-generated with random data
  await serviceRequestPage.fillServiceRequest(testBooking);
  await serviceRequestPage.submitRequest();
});
```

### Using Page Objects

```typescript
test('should navigate', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await homePage.selectCategory('Plumber');
});
```

---

## 🔍 Selectors Best Practices

### ✅ Good Selectors

```typescript
// Role-based (best)
page.getByRole('button', { name: 'Submit' })

// Test ID (recommended)
page.locator('[data-testid="submit-button"]')

// Label
page.getByLabel('Email')

// Placeholder
page.getByPlaceholder('Enter email')

// Text
page.getByText('Sign In')
```

### ❌ Avoid

```typescript
// CSS classes (fragile)
page.locator('.btn-primary.mt-4')

// Complex CSS (hard to maintain)
page.locator('div > ul > li:nth-child(2) > a')
```

---

## ⏱️ Waits & Timeouts

### ✅ Good Waits

```typescript
// Wait for element
await expect(page.locator('.result')).toBeVisible({ timeout: 5000 });

// Wait for network
await page.waitForLoadState('networkidle');

// Wait for URL
await page.waitForURL('/dashboard');

// Wait for selector
await page.waitForSelector('.element', { state: 'visible' });
```

### ❌ Avoid

```typescript
// Arbitrary timeout
await page.waitForTimeout(5000);
```

---

## 🧪 Assertions

```typescript
// Visibility
await expect(element).toBeVisible();
await expect(element).toBeHidden();

// Text
await expect(element).toHaveText('Expected text');
await expect(element).toContainText('partial');

// Value
await expect(input).toHaveValue('value');

// Count
await expect(elements).toHaveCount(5);

// URL
await expect(page).toHaveURL('/dashboard');
await expect(page).toHaveURL(/dashboard/);

// Attribute
await expect(element).toHaveAttribute('href', '/link');

// Class
await expect(element).toHaveClass('active');

// Disabled
await expect(button).toBeDisabled();
await expect(button).toBeEnabled();

// Checked
await expect(checkbox).toBeChecked();
```

---

## 🎨 Page Object Model Template

```typescript
export class NewPage {
  readonly page: Page;
  readonly element: Locator;
  readonly button: Locator;

  constructor(page: Page) {
    this.page = page;
    this.element = page.locator('[data-testid="element"]');
    this.button = page.getByRole('button', { name: 'Submit' });
  }

  async goto() {
    await this.page.goto('/path');
    await this.page.waitForLoadState('networkidle');
  }

  async clickButton() {
    await this.button.click();
  }

  async isElementVisible() {
    return await this.element.isVisible();
  }
}
```

---

## 🔧 Debugging Tips

### 1. Use Playwright Inspector
```bash
npx playwright test --debug
```

### 2. Add Pause
```typescript
await page.pause(); // Pauses execution
```

### 3. Take Screenshot
```typescript
await page.screenshot({ path: 'debug.png' });
```

### 4. Console Logs
```typescript
page.on('console', msg => console.log(msg.text()));
```

### 5. Slow Motion
```typescript
// In playwright.config.ts
use: {
  launchOptions: {
    slowMo: 1000, // 1 second delay
  },
}
```

---

## 🚨 Common Issues

### Issue: Element not found
**Solution:**
```typescript
// Add explicit wait
await page.waitForSelector('.element', { state: 'visible' });
await page.locator('.element').click();
```

### Issue: Test is flaky
**Solution:**
```typescript
// Use retry
test.describe.configure({ retries: 2 });

// Or use waitFor
await expect(element).toBeVisible({ timeout: 10000 });
```

### Issue: Timeout
**Solution:**
```typescript
// Increase timeout
test.setTimeout(60000); // 60 seconds

// Or in config
timeout: 60 * 1000,
```

---

## 📊 Test Organization

```
tests/
├── fixtures/           # Reusable test data
├── page-objects/       # Page Object Models
└── e2e/
    ├── functional/     # User flow tests
    ├── accessibility/  # A11y tests
    ├── integration/    # API tests
    └── performance/    # Performance tests
```

---

## 🎯 Coverage Goals

- ✅ Critical Paths: 100%
- ✅ User Flows: 90%
- ✅ Edge Cases: 70%
- ✅ Accessibility: WCAG 2.1 AA

---

## 📚 Resources

- [Full Testing Guide](./E2E_TESTING_GUIDE.md)
- [Enhancement Summary](./E2E_TEST_ENHANCEMENT_SUMMARY.md)
- [Playwright Docs](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)

---

## 💡 Pro Tips

1. **Use UI Mode** for development: `npm run test:e2e:ui`
2. **Use data-testid** for stable selectors
3. **Keep tests independent** - no shared state
4. **Mock external APIs** for faster tests
5. **Use Page Objects** for maintainability
6. **Run tests in parallel** for speed
7. **Take screenshots** on failure
8. **Use trace viewer** for debugging

---

**Quick Help**: Run `npx playwright test --help` for all options
