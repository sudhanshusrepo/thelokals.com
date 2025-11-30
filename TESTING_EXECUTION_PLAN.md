# Testing Execution Plan

**Date:** 2025-11-30  
**Status:** Ready to Execute  
**Priority:** Compliance Features First

---

## 🎯 Testing Strategy

### Phase 1: Compliance Tests (IMMEDIATE)
Focus on Play Store compliance features that were just implemented.

### Phase 2: Core Functionality Tests
Test main booking and user flows.

### Phase 3: Integration Tests
Test API endpoints and database operations.

---

## 📋 Test Execution Order

### 1. Support & Legal Links (Highest Priority)
**File:** `tests/e2e/client/support/legal-links.spec.ts`  
**Tests:** 16  
**Why First:** Validates Terms & Privacy pages we just created

```bash
npx playwright test tests/e2e/client/support/legal-links.spec.ts --project=chromium --headed
```

**Expected Results:**
- Support page navigation ✓
- Terms & Conditions link ✓
- Privacy Policy link ✓
- FAQ functionality ✓

---

### 2. Account Deletion & Logout
**File:** `tests/e2e/client/profile/account-deletion.spec.ts`  
**Tests:** 12  
**Why Second:** Critical compliance feature

```bash
npx playwright test tests/e2e/client/profile/account-deletion.spec.ts --project=chromium --headed
```

**Expected Results:**
- Delete account button visible ✓
- Double confirmation dialogs ✓
- Logout functionality ✓
- Session clearing ✓

**Known Issues:**
- Authentication flow needs setup
- Test user credentials required

---

### 3. Media Permissions
**File:** `tests/e2e/client/permissions/media-permissions.spec.ts`  
**Tests:** 30+  
**Why Third:** Validates camera/microphone permission handling

```bash
npx playwright test tests/e2e/client/permissions/media-permissions.spec.ts --project=chromium --headed
```

**Expected Results:**
- Permission request dialogs ✓
- Error messages on denial ✓
- Recording UI ✓
- Permission persistence ✓

---

## 🔧 Test Setup Required

### 1. Create Test User
```sql
-- Run in Supabase SQL Editor
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('test@thelokals.com', crypt('Test123!@#', gen_salt('bf')), NOW());
```

### 2. Update Test Configuration
```typescript
// tests/config/test-users.ts
export const TEST_USERS = {
  client: {
    email: 'test@thelokals.com',
    password: 'Test123!@#'
  },
  provider: {
    email: 'provider@thelokals.com',
    password: 'Provider123!@#'
  }
};
```

### 3. Start Dev Server
```bash
# Terminal 1: Start client
cd packages/client
npm run dev

# Terminal 2: Start provider (if testing provider portal)
cd packages/provider
npm run dev
```

---

## 🚀 Quick Test Commands

### Run All Compliance Tests
```bash
npx playwright test tests/e2e/client/profile tests/e2e/client/support tests/e2e/client/permissions --reporter=html
```

### Run Single Test with Debug
```bash
npx playwright test tests/e2e/client/support/legal-links.spec.ts --debug
```

### Run Tests in UI Mode
```bash
npx playwright test --ui
```

### Generate Test Report
```bash
npx playwright show-report
```

---

## 📊 Expected Test Results

### Compliance Tests (58+ tests)
| Test Suite | Tests | Expected Pass | Priority |
|------------|-------|---------------|----------|
| Legal Links | 16 | 14-16 | HIGH |
| Account Deletion | 12 | 8-12 | HIGH |
| Media Permissions | 30+ | 25-30 | HIGH |

### Known Failures (To Fix)
1. **Authentication Flow** - Need to implement test login
2. **Test Data** - Need seeded users and bookings
3. **API Mocking** - Some tests may need mocked responses

---

## 🔍 Manual Testing Checklist

### Web App - Legal Pages
- [ ] Navigate to `/dashboard/terms`
- [ ] Verify all 9 sections render
- [ ] Check dark mode toggle
- [ ] Test responsive design (mobile viewport)
- [ ] Navigate to `/dashboard/privacy` (after adding route)
- [ ] Verify all 10 sections render
- [ ] Test email links (support@thelokals.com)

### Mobile App - Legal Pages
- [ ] Open app and go to Support tab
- [ ] Tap "Terms & Conditions"
- [ ] Verify navigation to terms screen
- [ ] Scroll through all sections
- [ ] Go back and tap "Privacy Policy"
- [ ] Verify navigation to privacy screen
- [ ] Test email link tap

### Account Deletion Flow
- [ ] Login to web app
- [ ] Navigate to Profile
- [ ] Scroll to Account Management
- [ ] Click "Delete Account"
- [ ] Verify first warning dialog
- [ ] Accept first dialog
- [ ] Verify second confirmation
- [ ] Accept second dialog
- [ ] Verify success message
- [ ] Verify logout and redirect

### Media Permissions
- [ ] Navigate to service request page
- [ ] Click microphone button
- [ ] Allow permission in browser
- [ ] Verify recording UI appears
- [ ] Test stop/cancel buttons
- [ ] Click video button
- [ ] Allow camera permission
- [ ] Verify video preview
- [ ] Test recording functionality

---

## 🐛 Debugging Failed Tests

### Common Issues

**Issue 1: Authentication Timeout**
```
Error: Timeout waiting for /dashboard URL
```
**Solution:** Check if auth modal is blocking, update selectors

**Issue 2: Element Not Found**
```
Error: Locator not found: [data-testid="..."]
```
**Solution:** Verify component has correct data-testid attribute

**Issue 3: Permission Denied**
```
Error: Permission request failed
```
**Solution:** Grant permissions in test context:
```typescript
await context.grantPermissions(['camera', 'microphone']);
```

---

## 📈 Success Metrics

### Target Pass Rates
- **Compliance Tests:** \u003e 90%
- **Core Functionality:** \u003e 85%
- **Integration Tests:** \u003e 80%

### Performance Targets
- Test execution time: \u003c 10 minutes
- Page load time: \u003c 3 seconds
- API response time: \u003c 1 second

---

## 🎯 Next Steps After Testing

1. **Fix Failing Tests**
   - Update selectors
   - Add missing data-testid attributes
   - Implement test user setup

2. **Add Missing Routes**
   - Add Privacy Policy route to App.tsx
   - Update Support page links

3. **Expand Test Coverage**
   - Add provider portal tests
   - Add mobile app tests (Detox/Maestro)
   - Add API integration tests

4. **CI/CD Integration**
   - Add GitHub Actions workflow
   - Run tests on every PR
   - Generate coverage reports

---

## 🚀 Start Testing Now

**Recommended First Command:**
```bash
# Start with legal links test (most likely to pass)
npx playwright test tests/e2e/client/support/legal-links.spec.ts --headed --project=chromium
```

This will open a browser and show you exactly what's happening during the test.

**Status:** ✅ READY TO TEST
