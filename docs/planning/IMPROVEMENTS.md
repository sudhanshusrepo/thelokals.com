# Recommended Improvements

## Code Quality

### 1. Add Accessibility Attributes to Toast Messages
**Location**: `packages/client/components/ToastContainer.tsx`  
**Current**: Toast messages don't have `role="alert"` or `aria-live` attributes.  
**Improvement**: Add ARIA attributes for better accessibility:
```tsx
<div
  role="alert"
  aria-live="polite"
  className="pointer-events-auto flex items-center..."
>
```
**Benefit**: Screen readers will announce toast messages to users.

### 2. Improve Test Data Management
**Location**: `tests/fixtures/test-fixtures.ts`  
**Current**: Some tests use hardcoded emails like `test@example.com`.  
**Improvement**: Always use faker-generated unique emails, or implement a test user cleanup strategy.  
**Benefit**: More reliable tests, no conflicts between test runs.

### 3. Add Test IDs to More Components
**Location**: Various components  
**Current**: Only auth components have `data-testid` attributes.  
**Improvement**: Add `data-testid` to key UI elements:
- Service category cards
- Booking cards
- Navigation buttons
- Form inputs
**Benefit**: More robust and maintainable E2E tests.

## Performance

### 4. Optimize Logo Asset
**Location**: `packages/client/public/logo-small.png`  
**Current**: Using a temporary 47KB PNG.  
**Improvement**: Replace with a professionally optimized SVG (target: <10KB).  
**Benefit**: Faster LCP, better scalability across devices.

### 5. Implement Code Splitting for Routes
**Location**: `packages/client/App.tsx`  
**Current**: Some routes are lazy-loaded, but not all.  
**Improvement**: Ensure all route components use lazy loading:
```tsx
const CategoryPage = lazy(() => import('./components/CategoryPage'));
```
**Benefit**: Smaller initial bundle, faster first load.

### 6. Add Service Worker Caching Strategy
**Location**: `packages/client/vite.config.ts`  
**Current**: PWA is configured but caching strategy could be optimized.  
**Improvement**: Configure workbox for better offline support:
```ts
workbox: {
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60 // 5 minutes
        }
      }
    }
  ]
}
```
**Benefit**: Better offline experience, reduced API calls.

## Testing

### 7. Add API Integration Tests
**Location**: `tests/e2e/integration/`  
**Current**: Only one integration test file exists.  
**Improvement**: Add tests for:
- Database RPC functions (`create_ai_booking`, `find_nearby_providers`)
- Authentication flows
- Payment processing
**Benefit**: Catch backend issues earlier.

### 8. Add Accessibility Tests
**Location**: `tests/e2e/accessibility/`  
**Current**: Accessibility test directory exists but may be incomplete.  
**Improvement**: Use `@axe-core/playwright` to automate accessibility testing:
```ts
import { injectAxe, checkA11y } from 'axe-playwright';

test('homepage should be accessible', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  await checkA11y(page);
});
```
**Benefit**: Ensure WCAG compliance, better UX for all users.

### 9. Add Performance Tests
**Location**: `tests/e2e/performance/`  
**Current**: Performance test directory exists but may need updates.  
**Improvement**: Add Lighthouse CI integration to track Core Web Vitals over time.  
**Benefit**: Prevent performance regressions.

## Documentation

### 10. Add API Examples to API_REFERENCE.md
**Location**: `docs/API_REFERENCE.md`  
**Current**: Functions are documented but lack usage examples.  
**Improvement**: Add code examples for each RPC function:
```typescript
// Example: Creating an AI booking
const { bookingId } = await supabase.rpc('create_ai_booking', {
  p_client_id: user.id,
  p_service_category: 'Plumber',
  p_requirements: { issue: 'Leaking pipe' },
  // ...
});
```
**Benefit**: Easier onboarding for new developers.

### 11. Add Deployment Guide
**Location**: `docs/`  
**Current**: `DEPLOYMENT_SUMMARY.md` exists in root but not in `docs/`.  
**Improvement**: Create `docs/DEPLOYMENT_GUIDE.md` with step-by-step instructions for:
- Vercel deployment
- Supabase setup
- Environment variables
- Domain configuration
**Benefit**: Streamlined deployment process.

## Security

### 12. Add Rate Limiting to Auth Endpoints
**Location**: Supabase Edge Functions or RLS policies  
**Current**: Rate limiting test exists but implementation unclear.  
**Improvement**: Implement rate limiting for auth attempts at the database or edge function level.  
**Benefit**: Prevent brute force attacks.

### 13. Add Content Security Policy
**Location**: `packages/client/index.html`  
**Current**: No CSP headers.  
**Improvement**: Add CSP meta tag or configure in Vercel:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; ...">
```
**Benefit**: Mitigate XSS attacks.
