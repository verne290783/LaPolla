# Playwright E2E Testing Strategy & Infrastructure Analysis

## Executive Summary
This document presents a comprehensive analysis of the existing codebase, routing mechanism, and testing infrastructure for **La Polla** (Next.js 16 app with `next-intl`). It establishes a step-by-step strategy for installing, configuring, and executing Playwright End-to-End (E2E) automated tests to verify routing, locale redirection (`/` -> `/[locale]`), and prevent 404 NOT_FOUND errors in local production builds and Vercel deployments.

---

## 1. Current Test Setup in `package.json` & Project Structure

### 1.1 Dependency & Script Analysis (`package.json`)
A complete review of `package.json` revealed:
- **Framework**: Next.js `16.2.12`, React `19.2.4`, `next-intl` `^4.13.4`, `@supabase/supabase-js` `^2.112.0`.
- **Existing Scripts**:
  - `dev`: `next dev`
  - `build`: `next build`
  - `start`: `next start`
  - `lint`: `eslint`
- **Testing Packages**: Currently **NONE**. `@playwright/test` is not installed.
- **Testing Scripts**: Currently **NONE**. No `test` or `test:e2e` scripts exist.
- **Testing Configuration**: No `playwright.config.ts` or `playwright.config.js` exists in the repository root. No `e2e/` or `tests/` directory exists.

### 1.2 Application Architecture & Routing Analysis
- **Middleware** (`src/middleware.js`):
  ```javascript
  import createMiddleware from 'next-intl/middleware';

  export default createMiddleware({
    locales: ['es', 'en', 'it', 'pt'],
    defaultLocale: 'es'
  });

  export const config = {
    matcher: ['/', '/(es|en|it|pt)/:path*']
  };
  ```
  - **Behavior**: Directs requests to root `/` to `/[defaultLocale]` (default `es` -> `/es`).
  - **Locales Supported**: `es` (Spanish), `en` (English), `it` (Italian), `pt` (Portuguese).

- **App Router Structure** (`src/app`):
  - `src/app/[locale]/page.js`: Main login screen (`LoginPage` component rendering `LoginForm`).
  - `src/app/[locale]/hub/page.js`: Prediction hub page (`/es/hub`).
  - `src/app/[locale]/f1/page.js`: Formula 1 forecasts page (`/es/f1`).
  - `src/app/[locale]/leaderboard/page.js`: Classification leaderboard (`/es/leaderboard`).
  - `src/app/[locale]/profile/page.js`: User profile page (`/es/profile`).

- **Login Page UI Components (`src/components/LoginForm.js`)**:
  - Title: `t('title')` -> `"La Polla"`
  - Subtitle: `t('subtitle')` -> `"ELITE PREDICTION CLUB"`
  - Google OAuth Button: `"Continuar con Google"`
  - Email Field: `<input type="email" placeholder="tu@email.com" required />`
  - Password Field: `<input type="password" placeholder="••••••••" required />`
  - Submit Button: `<button type="submit">Iniciar Sesión</button>`
  - Language Switcher: `<select>` with options `es`, `en`, `it`, `pt`.

---

## 2. Detailed Plan for Playwright Installation & Configuration

### 2.1 Package Installation
To install Playwright as a developer dependency without altering runtime dependencies:
```bash
npm install -D @playwright/test
npx playwright install chromium
```

### 2.2 `package.json` Script Updates
The following scripts will be added to `package.json`:
```json
"scripts": {
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:headed": "playwright test --headed"
}
```

### 2.3 `playwright.config.ts` Configuration Plan
A proposed `playwright.config.ts` file in the project root:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
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

---

## 3. Test Suite Design (4 Tiers)

### Tier 1: Feature Coverage (Smoke & Core Routing)
*Goal: Guarantee application builds, starts, root redirection works, and primary routes render without 404 NOT_FOUND errors.*

1. **Test 1.1: Root Path Redirection (`/` -> `/es`)**
   - Action: Navigate to `http://localhost:3000/`.
   - Verification:
     - HTTP response status is not 404.
     - Final URL is `http://localhost:3000/es`.
     - Heading `<h1>` contains text `"La Polla"`.

2. **Test 1.2: Default Locale Login Page Verification (`/es`)**
   - Action: Navigate directly to `http://localhost:3000/es`.
   - Verification:
     - Response status is 200 OK.
     - Form elements present: `input[type="email"]`, `input[type="password"]`, `button[type="submit"]`.
     - Text content matches localized Spanish strings (`"ELITE PREDICTION CLUB"`, `"Iniciar Sesión"`).

3. **Test 1.3: Multi-Locale Route Load (`/en`, `/it`, `/pt`)**
   - Action: Navigate to `http://localhost:3000/en`, `/it`, and `/pt`.
   - Verification:
     - Each URL returns 200 OK without 404.
     - `/en` displays `"Log In"`, `"Continue with Google"`.
     - `/it` displays `"Accedi"`.
     - `/pt` displays `"Entrar"`.

4. **Test 1.4: App Route Verification (`/es/hub`, `/es/f1`, `/es/leaderboard`, `/es/profile`)**
   - Action: Navigate directly to internal routes.
   - Verification:
     - All routes return HTTP 200 OK.
     - No route returns Next.js default 404 page.

---

### Tier 2: Boundary & Edge Cases
*Goal: Ensure input constraints, form submissions, and non-existent route behaviors are handled gracefully.*

1. **Test 2.1: Non-Existent Route (404 Page Verification)**
   - Action: Navigate to `/non-existent-page-xyz` or `/es/unknown`.
   - Verification:
     - Serves standard Next.js 404 error page.
     - Application does not crash or throw unhandled server exception (500).

2. **Test 2.2: Form Validation on Empty Submit**
   - Action: Click `"Iniciar Sesión"` without filling email or password.
   - Verification:
     - HTML5 validation triggers (`:invalid` pseudo-class active on required inputs).
     - Success message is NOT shown.

3. **Test 2.3: Successful Mock Authentication Submission**
   - Action: Fill email `test@example.com` and password `password123`, submit form.
   - Verification:
     - Form switches state to success view (`styles.successState`).
     - Success text displayed: `"Correo de confirmación enviado"`.

---

### Tier 3: Cross-Feature Interactions
*Goal: Validate client-side state transitions, locale switching dropdown, and dynamic navigation.*

1. **Test 3.1: Language Switcher Dropdown Interaction**
   - Action: On `/es`, select `"English"` from the `<select>` language dropdown.
   - Verification:
     - URL changes dynamically from `/es` to `/en`.
     - UI strings instantly update to English translations.

2. **Test 3.2: Language Switcher Preservation Across Routes**
   - Action: On `/es/hub`, select `"English"`.
   - Verification:
     - URL changes to `/en/hub`.
     - Route path suffix (`/hub`) is preserved across locale switches.

---

### Tier 4: Real-World User Journey Scenario
*Goal: Simulate a full end-to-end user session from landing on the site to interacting with prediction features.*

1. **Test 4.1: Complete End-to-End User Journey**
   - **Steps**:
     1. User navigates to root domain `/`.
     2. System automatically redirects user to `/es`.
     3. User switches language to English (`/en`).
     4. User fills out the login form (`user@lapolla.com` / `securepass`) and submits.
     5. User views the confirmation state `"Correo de confirmación enviado"`.
     6. User navigates to `/en/f1` to inspect race forecasts and leaderboard pages (`/en/leaderboard`).
   - **Assertions**:
     - 0 HTTP 404 errors encountered throughout the entire flow.
     - All page elements render correctly within expected execution thresholds.

---

## 4. Command Execution Details

### 4.1 Production Build & Test Execution
To execute Playwright tests locally against a production build (mimicking Vercel deployment behavior):

1. **Build and Start Server manually (optional test mode)**:
   ```bash
   npm run build
   npm run start
   ```

2. **Run Playwright E2E Test Suite**:
   ```bash
   npx playwright test
   ```
   *(Note: The `webServer` option in `playwright.config.ts` automatically runs `npm run build && npm run start` if no server is running on port 3000).*

3. **Run with UI Mode (for interactive debugging)**:
   ```bash
   npx playwright test --ui
   ```

4. **Generate & View Test Report**:
   ```bash
   npx playwright show-report
   ```

---

## 5. Summary of Findings & Next Steps for Implementation Agent
- **Findings**: Project lacks testing packages and configuration. Middleware and App Router structure are correctly defined in code (`src/middleware.js`, `src/app/[locale]/page.js`), but local production build verification via automated tests is needed to isolate any Vercel deployment 404 issue.
- **Actionable Steps for Implementer**:
  1. Install `@playwright/test`.
  2. Create `playwright.config.ts`.
  3. Update `package.json` scripts.
  4. Create `e2e/routing.spec.ts` and `e2e/login.spec.ts` implementing Tiers 1 through 4.
  5. Run `npm run build && npm run start` and `npx playwright test` to verify zero test failures.
