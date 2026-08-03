# Milestone 2 Playwright E2E Test Suite Analysis & Blueprint

## Executive Summary
This document provides the complete, exact technical specification for implementing the Playwright E2E Test Suite for **La Polla** (Milestone 2). The suite validates Next.js 16 + next-intl locale routing, root redirection (`/` -> `/es`), 404 boundary handling, client-side language selection, form submission/validation, and multi-page user journey scenarios against a local production build (`npm run build && npm run start`).

---

## 1. Package Dependencies & Scripts (`package.json`)

### Specification
Add `@playwright/test` to `devDependencies` and register `"test:e2e": "playwright test"` in `scripts`.

### `package.json` Modification Blueprint
```json
{
  "name": "temp-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.112.0",
    "next": "16.2.12",
    "next-intl": "^4.13.4",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@playwright/test": "^1.49.1",
    "eslint": "^9",
    "eslint-config-next": "16.2.12"
  }
}
```

---

## 2. Playwright Configuration (`playwright.config.ts`)

### Specification
Create `playwright.config.ts` in the project root (`c:\Users\Edison\Desktop\La Polla\playwright.config.ts`).
The configuration must include:
- `webServer` block:
  - `command`: `'npm run build && npm run start'`
  - `url`: `'http://localhost:3000'`
  - `reuseExistingServer`: `!process.env.CI`
  - `timeout`: `120 * 1000` (120 seconds to allow for initial Next.js build and server startup)
- Base URL: `http://localhost:3000`
- Browser: Chromium (`desktop-chrome`)
- Fully parallel execution enabled.

### Exact `playwright.config.ts` Content
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

---

## 3. 4-Tier Playwright Test Suite Design (`tests/e2e/`)

### Tier 1: Routing & Redirection (`tests/e2e/tier1-routing.spec.ts`)
**Purpose**: Verify root `/` redirects to default locale `/es`, and all locale routes (`/es/login`, `/es/hub`, `/es/f1`, `/es/leaderboard`, `/es/profile`, `/en`, `/it`, `/pt`) return 200 OK without 404 errors.

```typescript
import { test, expect } from '@playwright/test';

test.describe('Tier 1: Routing & Redirection', () => {
  test('Root path / redirects to /es default locale with 200 OK', async ({ page }) => {
    const response = await page.goto('/');
    await expect(page).toHaveURL(/\/es/);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1.glow-text')).toHaveText('La Polla');
  });

  test('/es/login returns 200 OK and renders LoginForm', async ({ page }) => {
    const response = await page.goto('/es/login');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1.glow-text')).toHaveText('La Polla');
    await expect(page.locator('button[type="submit"]')).toHaveText('Iniciar Sesión');
  });

  test('All Spanish locale pages (/es/hub, /es/f1, /es/leaderboard, /es/profile) return 200 OK', async ({ page }) => {
    const routes = ['/es/hub', '/es/f1', '/es/leaderboard', '/es/profile'];
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
    }
  });

  test('Non-Spanish locales (/en, /it, /pt) return 200 OK and render correctly', async ({ page }) => {
    const locales = ['en', 'it', 'pt'];
    for (const locale of locales) {
      const response = await page.goto(`/${locale}`);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveURL(new RegExp(`/${locale}`));
    }
  });
});
```

---

### Tier 2: Boundary & Form Validation (`tests/e2e/tier2-boundary.spec.ts`)
**Purpose**: Verify 404 error handling on non-existent routes and test HTML5 form validation / success handling on the login form.

```typescript
import { test, expect } from '@playwright/test';

test.describe('Tier 2: Boundary & Form Validation', () => {
  test('Unknown routes return 404 status code or render 404 page', async ({ page }) => {
    const response = await page.goto('/non-existent-route-xyz');
    // Next.js returns 404 for missing routes
    expect(response?.status()).toBe(404);
  });

  test('Unknown locale route returns 404 status code', async ({ page }) => {
    const response = await page.goto('/es/unknown-nested-page-xyz');
    expect(response?.status()).toBe(404);
  });

  test('LoginForm requires email and password before submit', async ({ page }) => {
    await page.goto('/es/login');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    // Check required attribute
    await expect(emailInput).toHaveAttribute('required', '');
    await expect(passwordInput).toHaveAttribute('required', '');

    // Submit empty form should maintain page (no success state)
    await submitBtn.click();
    await expect(page.locator('h2')).not.toHaveText('Correo de confirmación enviado');
  });

  test('LoginForm submission displays success state', async ({ page }) => {
    await page.goto('/es/login');
    await page.fill('input[type="email"]', 'testuser@example.com');
    await page.fill('input[type="password"]', 'secretpassword123');
    await page.click('button[type="submit"]');

    // Verify success state rendered
    await expect(page.locator('h2')).toHaveText('Correo de confirmación enviado');
    await expect(page.getByText('Revisa tu bandeja de entrada para continuar.')).toBeVisible();
  });
});
```

---

### Tier 3: Locale Switcher Client-Side Integration (`tests/e2e/tier3-locale-switch.spec.ts`)
**Purpose**: Validate client-side locale switching via `LanguageSelector` dropdown and verify smooth language transition without page reload errors.

```typescript
import { test, expect } from '@playwright/test';

test.describe('Tier 3: Client-side Locale Switching', () => {
  test('Switching language from Spanish (es) to English (en) updates URL and UI text', async ({ page }) => {
    await page.goto('/es/login');
    
    // Select element
    const langSelect = page.locator('select');
    await expect(langSelect).toHaveValue('es');
    await expect(page.locator('button[type="submit"]')).toHaveText('Iniciar Sesión');

    // Change to English
    await langSelect.selectOption('en');

    // URL should change to /en or /en/login
    await page.waitForURL(/\/en/);
    await expect(langSelect).toHaveValue('en');
    await expect(page.locator('button[type="submit"]')).toHaveText('Sign In');
  });

  test('Switching language between Italian (it) and Portuguese (pt)', async ({ page }) => {
    await page.goto('/es/login');
    const langSelect = page.locator('select');

    // Switch to Italian
    await langSelect.selectOption('it');
    await page.waitForURL(/\/it/);
    await expect(langSelect).toHaveValue('it');

    // Switch to Portuguese
    await langSelect.selectOption('pt');
    await page.waitForURL(/\/pt/);
    await expect(langSelect).toHaveValue('pt');
  });
});
```

---

### Tier 4: End-to-End User Journey (`tests/e2e/tier4-user-journey.spec.ts`)
**Purpose**: Validate complete end-to-end user scenario: initial arrival at `/`, locale redirect, language change, form submission, and navigation across main application sections.

```typescript
import { test, expect } from '@playwright/test';

test.describe('Tier 4: End-to-End User Journey', () => {
  test('Complete User Journey: Landing -> Redirect -> Locale Switch -> Login -> Hub Navigation', async ({ page }) => {
    // 1. User arrives at root domain
    const initialResponse = await page.goto('/');
    expect(initialResponse?.status()).toBe(200);
    await expect(page).toHaveURL(/\/es/);

    // 2. User switches language to English
    const langSelect = page.locator('select');
    await langSelect.selectOption('en');
    await page.waitForURL(/\/en/);

    // 3. User submits login form in English
    await page.fill('input[type="email"]', 'user@lapolla.com');
    await page.fill('input[type="password"]', 'pass1234');
    await page.click('button[type="submit"]');
    await expect(page.locator('h2')).toHaveText('Confirmation email sent');

    // 4. User navigates to Hub page in English
    const hubResponse = await page.goto('/en/hub');
    expect(hubResponse?.status()).toBe(200);
    await expect(page.locator('h1.glow-text')).toHaveText('La Polla');
    await expect(page.getByRole('heading', { name: 'Formula 1' })).toBeVisible();

    // 5. User navigates to F1 page
    const f1Response = await page.goto('/en/f1');
    expect(f1Response?.status()).toBe(200);
    await expect(page.locator('h1.glow-text')).toHaveText('RACING CLUB');

    // 6. User navigates to Leaderboard page
    const leaderboardResponse = await page.goto('/en/leaderboard');
    expect(leaderboardResponse?.status()).toBe(200);
    await expect(page.locator('table')).toBeVisible();

    // 7. User navigates to Profile page
    const profileResponse = await page.goto('/en/profile');
    expect(profileResponse?.status()).toBe(200);
    await expect(page.locator('h2', { hasText: 'Alex F1' })).toBeVisible();
  });
});
```

---

## 4. Documentation Specifications

### Specification for `TEST_INFRA.md`
`TEST_INFRA.md` serves as the developer guide for the Playwright testing setup.
Key content requirements:
1. **Overview & Framework**: Playwright v1.49+ integrated with Next.js 16 App Router & next-intl.
2. **Prerequisites & Commands**:
   - Install dev dependency: `npm install -D @playwright/test`
   - Install browser binaries: `npx playwright install chromium`
   - Execute E2E tests: `npm run test:e2e` or `npx playwright test`
   - Run UI mode: `npx playwright test --ui`
3. **Configuration Details (`playwright.config.ts`)**:
   - `webServer` settings (`npm run build && npm run start`, port 3000, 120s timeout).
   - Test directory structure (`tests/e2e/`).
4. **Test Suite Tier Breakdown**:
   - Tier 1: Routing & Redirection (`tier1-routing.spec.ts`)
   - Tier 2: Boundary & Form Validation (`tier2-boundary.spec.ts`)
   - Tier 3: Client-side Locale Switching (`tier3-locale-switch.spec.ts`)
   - Tier 4: End-to-End User Journey (`tier4-user-journey.spec.ts`)

### Specification for `TEST_READY.md`
`TEST_READY.md` acts as the execution readiness signal and checklist for M3 validation.
Key content requirements:
1. **Infrastructure Readiness Checklist**:
   - [x] `@playwright/test` package added to `package.json`
   - [x] `"test:e2e"` script defined
   - [x] `playwright.config.ts` created with `webServer` target
   - [x] Chromium binaries installed
2. **Test Suite Inventory**:
   - `tests/e2e/tier1-routing.spec.ts`
   - `tests/e2e/tier2-boundary.spec.ts`
   - `tests/e2e/tier3-locale-switch.spec.ts`
   - `tests/e2e/tier4-user-journey.spec.ts`
3. **Execution Instructions**:
   - Local execution command: `npm run test:e2e`
   - Expected output: 100% passing specs across all 4 tiers with 0 404 errors on valid pages.

---

## 5. Verification Plan for Worker / Test Writer M2
1. Update `package.json` and run `npm install -D @playwright/test` & `npx playwright install chromium`.
2. Write `playwright.config.ts` in root directory.
3. Write `tests/e2e/tier1-routing.spec.ts`, `tests/e2e/tier2-boundary.spec.ts`, `tests/e2e/tier3-locale-switch.spec.ts`, `tests/e2e/tier4-user-journey.spec.ts`.
4. Create `TEST_INFRA.md` and `TEST_READY.md`.
5. Execute `npx playwright test` and confirm all 4 tiers pass cleanly.
