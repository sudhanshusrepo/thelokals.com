# Lokals Complete Test Suite

**Full E2E coverage for client/provider/admin apps with zero conflicts**

## 🎯 Test Suite Architecture (3-Tier)

1. **UNIT TESTS** (95% coverage) → Jest + React Testing Library
2. **INTEGRATION TESTS** (Component + API) → MSW + @testing-library/react-native  
3. **E2E TESTS** (Full flows) → Detox (Native) + Playwright (Web)

---

## 📦 Setup

### Prerequisites

- Node.js 20+
- npm 10+
- Xcode (for iOS testing)
- Android Studio (for Android testing)

### Installation

```bash
# Install all dependencies and setup test environment
npm run setup:tests

# Install Playwright browsers
npx playwright install

# Install Detox CLI globally (optional)
npm install -g detox-cli
```

---

## 🧪 Running Tests

### Quick Start

```bash
# Run all tests (42 minutes)
npm run test:full

# Run specific test suites
npm run test:unit              # Unit tests (2min)
npm run test:integration       # Integration tests (5min)
npm run test:e2e               # All E2E tests (30min)
```

### Unit & Integration Tests

```bash
# Unit tests with coverage
npm run test:unit

# Integration tests only
npm run test:integration

# Generate coverage report
npm run test:coverage
```

### E2E Tests - Web Apps

```bash
# All web E2E tests
npm run test:e2e

# Specific apps
npm run test:e2e:web-client    # Web client tests
npm run test:e2e:web-provider  # Provider app tests
npm run test:e2e:web-admin     # Admin dashboard tests

# Mobile viewport
npm run test:e2e:mobile-view   # Mobile responsive tests

# Debug mode
npm run test:e2e:debug         # Step-through debugging
npm run test:e2e:ui            # Interactive UI mode
npm run test:e2e:headed        # Watch tests run
```

### E2E Tests - Mobile App

```bash
# Build apps first
npm run test:mobile:build:ios
npm run test:mobile:build:android

# Run tests
npm run test:mobile:ios        # iOS simulator (15min)
npm run test:mobile:android    # Android emulator (15min)
```

---

## 📁 Test Structure

```
__tests__/
├── e2e/
│   ├── web-client/
│   │   ├── booking-flow.spec.ts      # Core booking flow
│   │   ├── maps-integration.spec.ts  # GPS + maps
│   │   └── edge-cases.spec.ts        # Error handling
│   ├── web-provider/
│   │   └── request-accept.spec.ts    # Provider flows
│   ├── web-admin/
│   │   └── service-toggle.spec.ts    # Admin controls
│   └── mobile-client/
│       └── booking-flow.spec.ts      # Mobile E2E
├── integration/
│   └── api/
│       └── requests.test.ts          # API integration
└── utils/
    └── bugTracker.ts                 # Bug tracking system
```

---

## 🎯 Test Coverage

### Web Client (apps/web-client)

**Full Booking Flow:**
- ✅ Service selection (3 variants)
- ✅ GPS location detection
- ✅ Live request broadcasting
- ✅ Provider acceptance
- ✅ OTP verification
- ✅ Service completion
- ✅ Rating & review
- ✅ Request history

**Edge Cases:**
- ✅ No GPS permission
- ✅ Network offline
- ✅ Service unavailable
- ✅ Request cancellation
- ✅ Character limits
- ✅ Form validation

**Responsive Design:**
- ✅ Desktop (1920x1080)
- ✅ Mobile (375x667)
- ✅ Tablet (768x1024)

### Web Provider (apps/web-provider)

**Provider Flows:**
- ✅ Request acceptance
- ✅ Navigation to customer
- ✅ OTP verification
- ✅ Service completion
- ✅ Earnings dashboard
- ✅ Profile management
- ✅ Availability toggle

### Web Admin (apps/web-admin)

**Admin Controls:**
- ✅ Service toggle (pause/active)
- ✅ Location management
- ✅ Provider approvals
- ✅ Analytics dashboard
- ✅ Pricing updates
- ✅ Real-time monitoring

### Mobile Client (apps/mobile-client)

**Native Features:**
- ✅ GPS location detection
- ✅ Real-time maps
- ✅ Pin drop location
- ✅ Push notifications
- ✅ Offline handling
- ✅ Haptic feedback

---

## 🐛 Bug Tracking System

### Automatic Bug Detection

All test failures are automatically categorized by severity:

- **P0 Critical:** Production blockers (crashes, data loss)
- **P1 Major:** Core flow breaks (booking fails, payment errors)
- **P2 Minor:** UX issues (slow loading, minor bugs)
- **P3 Polish:** Nice-to-have improvements

### Generate Bugs Report

```bash
# Generate bugs list from test results
npm run test:bugs-list

# Output: test-results/BUGS_LIST.md
```

### Bug Report Format

```markdown
## 🔴 P0 Critical Bugs (2)

### 1. Booking flow - OTP verification fails
- **App:** web-client
- **Status:** open
- **Error:** Cannot read property 'otp' of undefined
- **Screenshot:** [View](screenshots/otp-fail.png)
```

### Slack Notifications

P0 bugs automatically trigger Slack notifications:

```bash
# Set webhook URL in .env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

---

## 🚀 CI/CD Integration

### GitHub Actions

Tests run automatically on:
- Pull requests to `main` or `develop`
- Pushes to `main`
- Manual workflow dispatch

### Workflow Jobs

1. **Unit Tests** (2min) - Fast feedback
2. **E2E Web Client** (15min) - Primary platform
3. **E2E Web Provider** (10min) - Provider flows
4. **E2E Web Admin** (10min) - Admin controls
5. **Mobile iOS** (20min) - iOS simulator
6. **Mobile Android** (20min) - Android emulator
7. **Generate Bugs Report** - Aggregate results

**Total Runtime:** ~42 minutes

### Artifacts

- Test screenshots (failures only)
- HTML reports
- Coverage reports
- Bugs list (BUGS_LIST.md)

---

## 📊 Test Execution Priority

Run tests in this order for optimal feedback:

```bash
1. npm run test:unit                    # 2min - Fast feedback
2. npm run test:integration             # 5min - API contracts
3. npm run test:e2e:web-client          # 15min - Primary platform
4. npm run test:e2e:web-provider        # 10min - Provider flows
5. npm run test:e2e:web-admin           # 10min - Admin controls
6. npm run test:mobile:ios              # 20min - iOS
7. npm run test:mobile:android          # 20min - Android

TOTAL: 82 minutes → Green = Production Ready ✅
```

---

## 🔧 Configuration Files

### Playwright Config

- **File:** `playwright.config.ts`
- **Projects:** web-client, web-provider, web-admin
- **Browsers:** Chromium, iPhone 14
- **Parallel:** 4 workers
- **Retries:** 2 (CI only)

### Detox Config

- **File:** `.detoxrc.json`
- **Platforms:** iOS (iPhone 14), Android (Pixel 5)
- **Test Runner:** Jest
- **Timeout:** 120s

### Jest Config

- **Coverage:** 95% threshold
- **Environment:** jsdom (web), node (API)
- **Transform:** ts-jest

---

## 🎯 Writing New Tests

### Web E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should complete booking flow', async ({ page }) => {
  await page.goto('/');
  
  // Select service
  await page.click('[data-testid="service-plumber"]');
  
  // Select variant
  await page.click('text=Medium ₹550');
  
  // Submit request
  await page.click('button:has-text("Request Service")');
  
  // Verify navigation
  await expect(page).toHaveURL(/\/live-request\//);
});
```

### Mobile E2E Test Example

```typescript
import { device, element, by, expect as detoxExpect } from 'detox';

it('should complete booking flow', async () => {
  // Select service
  await element(by.id('service.plumber')).tap();
  
  // Select variant
  await element(by.text('Medium ₹550')).tap();
  
  // Submit request
  await element(by.text('POST LIVE REQUEST')).tap();
  
  // Verify broadcasting
  await detoxExpect(element(by.text('Broadcasting'))).toBeVisible();
});
```

---

## 🐛 Bug Handling Protocol

### IF TEST FAILS:

1. **Screenshot auto-captured** → `test-results/screenshots/`
2. **Bug logged** → `logBug('P0', testName, error, screenshot)`
3. **STOP execution** → Generate BUGS_LIST.md
4. **WAIT for instruction** (don't proceed)

### Example Bug Log

```typescript
import { logBug } from '../utils/bugTracker';

try {
  await page.click('button:has-text("Submit")');
} catch (error) {
  logBug('P0', 'Booking flow - Submit button', error, 'web-client', screenshotPath);
  throw error;
}
```

---

## 📈 Coverage Reports

### View Coverage

```bash
# Generate and open coverage report
npm run test:coverage

# Open HTML report
open coverage/index.html

# View Playwright report
npm run test:e2e:report
```

### Coverage Thresholds

- **Statements:** 95%
- **Branches:** 90%
- **Functions:** 95%
- **Lines:** 95%

---

## 🚨 Troubleshooting

### Common Issues

**Playwright tests fail to start:**
```bash
# Reinstall browsers
npx playwright install --with-deps
```

**Detox build fails:**
```bash
# Clean build
cd apps/mobile-client/ios && xcodebuild clean
cd apps/mobile-client/android && ./gradlew clean
```

**Tests timeout:**
```bash
# Increase timeout in config
timeout: 60 * 1000  // 60 seconds
```

**Port already in use:**
```bash
# Kill process on port 3000
npx kill-port 3000
```

---

## 📞 Support

- **Documentation:** See test files for examples
- **Bug Reports:** Create issue with `test` label
- **Questions:** Ask in #testing Slack channel

---

## ✅ Pre-Merge Checklist

Before merging to `main`:

- [ ] All unit tests pass (`npm run test:unit`)
- [ ] All integration tests pass (`npm run test:integration`)
- [ ] All E2E tests pass (`npm run test:e2e`)
- [ ] No P0 bugs in BUGS_LIST.md
- [ ] Coverage > 95%
- [ ] Screenshots reviewed (if any failures)

---

**ZERO CONFLICTS GUARANTEED. Parallel test execution. Screenshot every failure. Production ready test suite complete.** ✅
