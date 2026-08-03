# E2E Test Infrastructure Guide (`TEST_INFRA.md`)

## 1. Overview & Framework
This project uses **Playwright** (`@playwright/test` v1.49+) for automated End-to-End (E2E) testing. The test infrastructure is designed to validate Next.js 16 App Router navigation, `next-intl` multi-language routing (`es`, `en`, `it`, `pt`), root path redirection (`/` -> `/es`), client-side locale switching, boundary/error handling, and user interaction flows.

---

## 2. Prerequisites & Setup Commands

### Installation
Ensure dev dependencies are installed:
```bash
npm install -D @playwright/test
```

Install the Playwright browser binary (Chromium):
```bash
npx playwright install chromium
```

### Test Execution Commands
Run the complete E2E test suite in headless mode (automatically starts local production server):
```bash
npm run test:e2e
# or
npx playwright test
```

Run tests using the Playwright Interactive UI mode:
```bash
npx playwright test --ui
```

Run a specific test tier:
```bash
npx playwright test tests/e2e/tier1-routing.spec.ts
```

---

## 3. Configuration Details (`playwright.config.ts`)

The Playwright configuration file is located at `playwright.config.ts` in the project root:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### Key Configuration Points:
- **`webServer`**: Automatically builds (`npm run build`) and starts (`npm run start`) the Next.js production server on `http://localhost:3000` before running tests. Timeout is set to 120 seconds to allow for full build completion.
- **`testDir`**: All E2E test files are located in `tests/e2e/`.
- **`fullyParallel`**: Specs execute in parallel for fast test runs.

---

## 4. Test Suite Architecture (4-Tier Design)

The test suite is structured into 4 distinct tiers in `tests/e2e/`:

### Tier 1: Routing & Redirection (`tests/e2e/tier1-routing.spec.ts`)
- Explicitly asserts HTTP 307 Temporary Redirect status code and `Location` header on root path `/` using `page.request.get('/', { maxRedirects: 0 })`.
- Explicitly asserts HTTP 307 Temporary Redirect status code and `Location` headers on un-prefixed routes (`/login`, `/hub`, `/f1`, `/profile`), and verifies following redirects lands on `/es/*` with 200 OK.
- Tests `/es/login` landing page rendering `LoginForm` with 200 OK.
- Tests all main Spanish application routes (`/es/hub`, `/es/f1`, `/es/leaderboard`, `/es/profile`) return 200 OK without 404 errors.
- Tests non-Spanish locale entry points (`/en`, `/it`, `/pt`) return 200 OK.

### Tier 2: Boundary & Form Validation (`tests/e2e/tier2-boundary.spec.ts`)
- Tests unknown routes (`/non-existent-route-xyz` and `/es/unknown-nested-page-xyz`) return 404 status codes.
- Tests HTML5 required field validation on the `LoginForm` (`email` and `password`).
- Tests successful form submission and confirmation UI state rendering.

### Tier 3: Client-Side Locale Switching (`tests/e2e/tier3-locale-switch.spec.ts`)
- Tests changing the language dropdown (`LanguageSelector`) from Spanish (`es`) to English (`en`) and validates URL update to `/en` and localized submit button text ("Sign In").
- Tests switching between Italian (`it`) and Portuguese (`pt`) options dynamically, with explicit DOM text assertions for Italian submit button ("Accedi") and Portuguese submit button ("Entrar") alongside title header ("La Polla").

### Tier 4: End-to-End User Journey (`tests/e2e/tier4-user-journey.spec.ts`)
- End-to-end multi-step workflow test:
  1. Navigate to `/` -> auto redirect to `/es`
  2. Switch language to English (`/en`)
  3. Submit login form
  4. Navigate through `/en/hub`, `/en/f1`, `/en/leaderboard`, and `/en/profile` checking headings and elements.

