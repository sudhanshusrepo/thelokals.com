# Testing Guide

## Overview

We use a comprehensive testing strategy involving:
1.  **E2E Tests (Playwright)**: Critical user journeys (Booking, Auth, Provider flows).
2.  **Static Analysis**: TypeScript & ESLint.

## End-to-End (E2E) Testing

Located in `tests/e2e/`.

### Setup

1.  **Install Browsers**
    ```bash
    npx playwright install --with-deps
    ```

2.  **Environment Variables**
    Create `.env.test` (or use `.env`):
    ```bash
    VITE_SUPABASE_URL=...
    VITE_SUPABASE_ANON_KEY=...
    ```

### Running Tests

- **Run All Tests**:
  ```bash
  npm run test:e2e
  ```

- **Run Specific Test**:
  ```bash
  npm run test:e2e tests/e2e/functional/booking-enhanced.spec.ts
  ```

- **UI Mode (Best for Dev)**:
  ```bash
  npm run test:e2e:ui
  ```

- **Debug Mode**:
  ```bash
  npx playwright test --debug
  ```

### Test Structure

```
tests/
├── fixtures/           # Reusable test data & setup
├── page-objects/       # Page Object Models (POM)
├── e2e/
│   ├── functional/     # Core user flows
│   ├── accessibility/  # A11y tests
│   └── integration/    # API/Integration tests
```

### Best Practices

1.  **Use Page Objects**: Encapsulate UI interactions in `page-objects/`.
2.  **Use Fixtures**: Use `test-fixtures.ts` for consistent data setup.
3.  **Semantic Selectors**: Prefer `getByRole`, `getByLabel`, or `data-testid`.
4.  **Isolation**: Tests should not depend on each other. Use `beforeEach` to set up state.
5.  **Mocking**: Mock external APIs (like Payment Gateways) where appropriate.

## Critical Test Paths

1.  **Authentication**: Sign Up, Sign In, Logout.
2.  **Booking Flow**:
    - AI Booking Creation (Service Request).
    - Provider Matching.
    - Booking Confirmation.
3.  **Provider Flow**:
    - Profile Management.
    - Accepting Bookings.
    - Completing Jobs.

## Troubleshooting

- **Flaky Tests**: Use `await expect(...).toBeVisible()` instead of fixed timeouts.
- **Timeouts**: Increase timeout in `playwright.config.ts` if running on slow hardware.
- **Auth Issues**: Ensure test users are correctly seeded or created in `beforeAll`.
