# Comprehensive E2E Testing Plan
## All Applications - Client, Provider, Mobile App

**Generated:** 2025-11-30  
**Status:** Ready for Implementation  
**Coverage:** Client Web App, Provider Portal, Mobile App (React Native)

---

## 🎯 Testing Objectives

### Primary Goals
1. **Functional Coverage**: Test all critical user flows end-to-end
2. **Cross-Platform**: Ensure consistency across web and mobile
3. **Compliance Verification**: Validate Play Store compliance features
4. **Performance**: Measure and optimize load times
5. **Accessibility**: Ensure WCAG 2.1 AA compliance

### Success Criteria
- ✅ 95%+ pass rate across all test suites
- ✅ All critical paths functional
- ✅ Zero blocking bugs
- ✅ Performance metrics within targets
- ✅ Accessibility score \u003e 90

---

## 📱 Test Scope by Application

### 1. Client Web App (`packages/client`)
**Platform:** React + Vite  
**Test Framework:** Playwright  
**Coverage Target:** 90%

#### Critical Flows
1. **Authentication**
   - Sign up with email
   - Sign in with email
   - Password reset
   - Social login (if implemented)
   - Session persistence

2. **Service Discovery**
   - Browse service categories
   - Search for services
   - View service details
   - Filter by location

3. **AI-Enhanced Booking**
   - Submit service request via chat
   - AI analysis and checklist generation
   - Review estimated costs
   - Confirm booking
   - Live provider matching

4. **Booking Management**
   - View booking list (Upcoming/Active/Past)
   - Filter bookings by status
   - View booking details
   - Cancel booking
   - Reschedule booking

5. **Payment Flow**
   - Select payment method
   - Complete payment (test mode)
   - View payment confirmation
   - Download invoice

6. **Reviews & Ratings**
   - Submit review after service completion
   - Rate provider (1-5 stars)
   - View review history

7. **Profile Management**
   - Edit profile information
   - Upload profile picture
   - Update contact details
   - **Logout**
   - **Delete account** (Compliance)

8. **Support & Legal** (Compliance)
   - Access support page
   - View FAQ
   - Access Privacy Policy
   - Access Terms & Conditions

9. **Media Permissions** (Compliance)
   - Request microphone permission
   - Request camera permission
   - Handle permission denial

---

### 2. Provider Portal (`packages/provider`)
**Platform:** React + Vite  
**Test Framework:** Playwright  
**Coverage Target:** 85%

#### Critical Flows
1. **Provider Authentication**
   - Provider sign up
   - Provider sign in
   - Profile verification

2. **Booking Management**
   - View incoming booking requests
   - Accept/Reject bookings
   - Update booking status (In Progress, Completed)
   - View booking history

3. **Service Management**
   - Add/Edit services offered
   - Set pricing
   - Update availability
   - Manage service areas

4. **Earnings & Payments**
   - View earnings dashboard
   - Track pending payments
   - View payment history
   - Update payment details

5. **Profile Management**
   - Edit provider profile
   - Upload documents
   - Update certifications
   - Manage working hours

6. **Notifications**
   - Receive booking notifications
   - View notification history
   - Manage notification preferences

---

### 3. Mobile App (`packages/app`)
**Platform:** React Native + Expo  
**Test Framework:** Detox / Maestro  
**Coverage Target:** 80%

#### Critical Flows
1. **Onboarding**
   - View onboarding screens
   - Skip onboarding
   - Complete onboarding

2. **Authentication**
   - Sign up
   - Sign in
   - Biometric authentication (if implemented)

3. **Home Screen**
   - View service categories
   - Scroll through "How It Works"
   - Access sticky chat CTA

4. **AI Booking**
   - Use chat input (text)
   - **Record audio** (Permission test)
   - **Record video** (Permission test)
   - View AI processing states
   - Navigate to booking confirmation

5. **Bookings Tab**
   - View bookings list
   - Filter by status
   - View booking details

6. **Profile Tab**
   - Edit profile
   - **Logout**
   - **Delete account** (Compliance)

7. **Support Tab** (Compliance)
   - View support options
   - Access FAQ
   - **Access Privacy Policy**
   - **Access Terms & Conditions**

8. **Permissions** (Compliance)
   - **Camera permission request**
   - **Microphone permission request**
   - Handle permission denial
   - Permission settings navigation

---

## 🧪 Test Structure

### Directory Organization
```
tests/
├── e2e/
│   ├── client/
│   │   ├── auth/
│   │   │   ├── signup.spec.ts
│   │   │   ├── signin.spec.ts
│   │   │   └── password-reset.spec.ts
│   │   ├── booking/
│   │   │   ├── ai-booking.spec.ts
│   │   │   ├── booking-management.spec.ts
│   │   │   └── payment.spec.ts
│   │   ├── profile/
│   │   │   ├── edit-profile.spec.ts
│   │   │   ├── account-deletion.spec.ts (Compliance)
│   │   │   └── logout.spec.ts
│   │   ├── support/
│   │   │   ├── support-page.spec.ts (Compliance)
│   │   │   └── legal-links.spec.ts (Compliance)
│   │   └── permissions/
│   │       ├── camera-permission.spec.ts (Compliance)
│   │       └── microphone-permission.spec.ts (Compliance)
│   ├── provider/
│   │   ├── auth/
│   │   ├── bookings/
│   │   ├── earnings/
│   │   └── profile/
│   └── mobile/
│       ├── onboarding/
│       ├── auth/
│       ├── booking/
│       ├── profile/
│       ├── support/ (Compliance)
│       └── permissions/ (Compliance)
├── integration/
│   ├── api/
│   │   ├── auth.spec.ts
│   │   ├── bookings.spec.ts
│   │   ├── payments.spec.ts
│   │   └── account-deletion.spec.ts (Compliance)
│   └── database/
├── accessibility/
│   ├── client-a11y.spec.ts
│   └── provider-a11y.spec.ts
└── performance/
    ├── client-perf.spec.ts
    └── provider-perf.spec.ts
```

---

## 🔧 Test Implementation

### Phase 1: Client Web App (Week 1)
**Priority:** HIGH - Core revenue flow

#### Day 1-2: Authentication & Setup
```bash
# Create test files
npx playwright codegen http://localhost:3000
```

**Tests to Create:**
- `tests/e2e/client/auth/signup.spec.ts`
- `tests/e2e/client/auth/signin.spec.ts`
- `tests/e2e/client/auth/logout.spec.ts`

#### Day 3-4: Booking Flow
**Tests to Create:**
- `tests/e2e/client/booking/ai-booking-flow.spec.ts`
- `tests/e2e/client/booking/booking-management.spec.ts`
- `tests/e2e/client/booking/payment-flow.spec.ts`

#### Day 5: Compliance Features
**Tests to Create:**
- `tests/e2e/client/profile/account-deletion.spec.ts`
- `tests/e2e/client/support/legal-links.spec.ts`
- `tests/e2e/client/permissions/media-permissions.spec.ts`

---

### Phase 2: Provider Portal (Week 2)
**Priority:** HIGH - Provider experience

#### Day 1-2: Provider Auth & Onboarding
**Tests to Create:**
- `tests/e2e/provider/auth/provider-signup.spec.ts`
- `tests/e2e/provider/auth/provider-signin.spec.ts`

#### Day 3-4: Booking Management
**Tests to Create:**
- `tests/e2e/provider/bookings/accept-booking.spec.ts`
- `tests/e2e/provider/bookings/update-status.spec.ts`
- `tests/e2e/provider/bookings/complete-booking.spec.ts`

#### Day 5: Profile & Earnings
**Tests to Create:**
- `tests/e2e/provider/profile/edit-profile.spec.ts`
- `tests/e2e/provider/earnings/view-earnings.spec.ts`

---

### Phase 3: Mobile App (Week 3)
**Priority:** MEDIUM - Play Store readiness

#### Day 1-2: Setup Mobile Testing
```bash
# Install Detox or Maestro
npm install --save-dev detox
# OR
curl -Ls "https://get.maestro.mobile.dev" | bash
```

#### Day 3-4: Core Flows
**Tests to Create:**
- `tests/e2e/mobile/auth/mobile-auth.spec.ts`
- `tests/e2e/mobile/booking/mobile-booking.spec.ts`

#### Day 5: Compliance Features
**Tests to Create:**
- `tests/e2e/mobile/permissions/camera-permission.spec.ts`
- `tests/e2e/mobile/permissions/microphone-permission.spec.ts`
- `tests/e2e/mobile/support/support-legal.spec.ts`
- `tests/e2e/mobile/profile/account-deletion.spec.ts`

---

## 📝 Sample Test Templates

### Client Web App - Account Deletion Test
```typescript
// tests/e2e/client/profile/account-deletion.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Account Deletion - Compliance', () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await page.goto('/');
    await page.click('[data-testid="sign-in-button"]');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="submit-button"]');
    await expect(page).toHaveURL('/dashboard/bookings');
  });

  test('should display delete account button', async ({ page }) => {
    await page.goto('/dashboard/profile');
    await expect(page.locator('text=Delete Account')).toBeVisible();
  });

  test('should show double confirmation dialog', async ({ page }) => {
    await page.goto('/dashboard/profile');
    
    // First confirmation
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('WARNING');
      await dialog.accept();
    });
    
    await page.click('text=Delete Account');
    
    // Second confirmation
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('confirm one more time');
      await dialog.accept();
    });
  });

  test('should logout after account deletion request', async ({ page }) => {
    await page.goto('/dashboard/profile');
    
    // Handle both confirmation dialogs
    let dialogCount = 0;
    page.on('dialog', async dialog => {
      dialogCount++;
      await dialog.accept();
    });
    
    await page.click('text=Delete Account');
    
    // Should redirect to home page
    await expect(page).toHaveURL('/');
    expect(dialogCount).toBe(2);
  });
});
```

### Client Web App - Media Permissions Test
```typescript
// tests/e2e/client/permissions/media-permissions.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Media Permissions - Compliance', () => {
  test('should request microphone permission for audio recording', async ({ page, context }) => {
    await context.grantPermissions(['microphone']);
    
    await page.goto('/service/plumber');
    await page.click('[title="Record Audio"]');
    
    // Should show audio recording UI
    await expect(page.locator('[data-testid="audio-recording-ui"]')).toBeVisible();
  });

  test('should show error message when microphone permission denied', async ({ page, context }) => {
    // Deny microphone permission
    await context.grantPermissions([]);
    
    await page.goto('/service/plumber');
    
    // Listen for alert
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Microphone access is required');
      await dialog.accept();
    });
    
    await page.click('[title="Record Audio"]');
  });

  test('should request camera permission for video recording', async ({ page, context }) => {
    await context.grantPermissions(['camera', 'microphone']);
    
    await page.goto('/service/plumber');
    await page.click('[title="Record Video"]');
    
    // Should show video recording UI
    await expect(page.locator('video')).toBeVisible();
  });
});
```

### Mobile App - Support & Legal Links Test
```typescript
// tests/e2e/mobile/support/support-legal.spec.ts
import { device, element, by, expect as detoxExpect } from 'detox';

describe('Support & Legal Links - Compliance', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should navigate to support tab', async () => {
    await element(by.text('Support')).tap();
    await detoxExpect(element(by.text('Customer Support'))).toBeVisible();
  });

  it('should display privacy policy link', async () => {
    await element(by.text('Support')).tap();
    await detoxExpect(element(by.text('Privacy Policy'))).toBeVisible();
  });

  it('should display terms of service link', async () => {
    await element(by.text('Support')).tap();
    await detoxExpect(element(by.text('Terms of Service'))).toBeVisible();
  });

  it('should open privacy policy in browser', async () => {
    await element(by.text('Support')).tap();
    await element(by.text('Privacy Policy')).tap();
    // Verify external link opened
    // Note: Actual verification depends on platform
  });
});
```

---

## 🚀 Execution Plan

### Running Tests

#### Client Web App
```bash
# Run all client tests
npx playwright test tests/e2e/client

# Run specific suite
npx playwright test tests/e2e/client/auth

# Run with UI mode
npx playwright test --ui

# Run on specific browser
npx playwright test --project=chromium

# Run compliance tests only
npx playwright test tests/e2e/client/profile/account-deletion.spec.ts
npx playwright test tests/e2e/client/support/legal-links.spec.ts
npx playwright test tests/e2e/client/permissions/
```

#### Provider Portal
```bash
# Run all provider tests
npx playwright test tests/e2e/provider

# Run with headed browser
npx playwright test tests/e2e/provider --headed
```

#### Mobile App (Detox)
```bash
# Build app for testing
detox build --configuration ios.sim.debug

# Run tests
detox test --configuration ios.sim.debug

# Run specific test
detox test tests/e2e/mobile/support/support-legal.spec.ts
```

#### Mobile App (Maestro)
```bash
# Run flow
maestro test flows/support-legal-flow.yaml

# Run with recording
maestro test --record flows/account-deletion-flow.yaml
```

---

## 📊 Test Reporting

### Continuous Integration
```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  client-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run client tests
        run: npx playwright test tests/e2e/client
      - name: Upload report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  provider-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Run provider tests
        run: npx playwright test tests/e2e/provider

  mobile-tests:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup iOS simulator
        run: |
          xcrun simctl boot "iPhone 14"
      - name: Run mobile tests
        run: detox test --configuration ios.sim.release
```

---

## ✅ Compliance Testing Checklist

### Play Store Requirements
- [ ] **Privacy Policy Link** - Accessible from Support page
- [ ] **Terms of Service Link** - Accessible from Support page
- [ ] **Account Deletion** - Functional with double confirmation
- [ ] **Camera Permission** - Explicit request with error handling
- [ ] **Microphone Permission** - Explicit request with error handling
- [ ] **Permission Denial** - User-friendly error messages
- [ ] **Data Transparency** - Clear messaging about data usage

### Test Coverage
- [ ] All compliance features have E2E tests
- [ ] Tests run on multiple platforms (iOS, Android, Web)
- [ ] Tests verify user-facing messages
- [ ] Tests check navigation flows
- [ ] Tests validate error states

---

## 📈 Success Metrics

### Target Metrics
| Metric | Target | Current |
|--------|--------|---------|
| Test Pass Rate | \u003e95% | TBD |
| Code Coverage | \u003e80% | TBD |
| Test Execution Time | \u003c10 min | TBD |
| Flaky Tests | \u003c2% | TBD |
| Critical Bugs | 0 | TBD |

### Performance Targets
| Page | Load Time | Target |
|------|-----------|--------|
| Home | \u003c2s | TBD |
| Service Request | \u003c3s | TBD |
| Booking Confirmation | \u003c2s | TBD |
| Dashboard | \u003c3s | TBD |

---

## 🎯 Next Steps

1. **Week 1**: Implement client web app tests
2. **Week 2**: Implement provider portal tests
3. **Week 3**: Implement mobile app tests
4. **Week 4**: CI/CD integration and optimization

**Ready to start?** Let's begin with the client web app E2E tests!
