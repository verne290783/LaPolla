# Handoff Report — Test Harness Challenger (Milestone 2)

**Verdict**: `REJECT`

---

## 1. Observation

Direct examination of the Playwright E2E test files in `tests/e2e/` (`tier1-routing.spec.ts`, `tier2-boundary.spec.ts`, `tier3-locale-switch.spec.ts`, `tier4-user-journey.spec.ts`) and project configuration/specs (`PROJECT.md`, `ORIGINAL_REQUEST.md`, `playwright.config.ts`) revealed the following exact lines and gaps:

### A. Missing 307 Redirect HTTP Status Code Assertions
- **File**: `tests/e2e/tier1-routing.spec.ts` (lines 4-9):
```typescript
  test('Root path / redirects to /es default locale with 200 OK', async ({ page }) => {
    const response = await page.goto('/');
    await expect(page).toHaveURL(/\/es/);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1.glow-text')).toHaveText('La Polla');
  });
```
- **Observation**: `page.goto('/')` transparently follows HTTP redirects. The `response` object bound on line 5 represents the final destination page (`/es`), returning HTTP status 200. There is **no assertion checking the intermediate HTTP 307 Temporary Redirect status code**, nor is `response.request().redirectedFrom()` or `page.request.get('/', { maxRedirects: 0 })` utilized.
- **Contract Spec (`PROJECT.md` line 31-32)**:
  > `Root / redirect: 307 to /[locale] (/es)`  
  > `Un-prefixed routes (e.g. /login): 307 redirect to /es/login`

### B. Missing Test Coverage for Un-prefixed Route Redirects
- **Observation**: `PROJECT.md` Feature 1 and Interface Contracts explicitly specify that un-prefixed routes like `/login`, `/hub`, `/f1`, and `/profile` must issue a 307 redirect to `/es/login`, `/es/hub`, etc.
- **File Scope**: `tests/e2e/tier1-routing.spec.ts` only tests `/` and direct prefixed routes (`/es/login`, `/es/hub`, `/en`, etc.). No test in `tests/e2e/` navigates to un-prefixed routes to verify redirect behavior or 307 status code responses.

### C. Weak DOM Assertions in Tier 3 Locale Switch Test
- **File**: `tests/e2e/tier3-locale-switch.spec.ts` (lines 21-34):
```typescript
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
```
- **Observation**: Lines 28 and 33 only assert `<select>` element value (`expect(langSelect).toHaveValue(...)`). No translated DOM text elements (e.g. submit button text, title text, or input placeholders in Italian or Portuguese) are asserted to verify actual DOM rendering under non-English/non-Spanish locales.

---

## 2. Logic Chain

1. **Premise 1 (Prompt Requirement & Contract)**: Milestone 2 requires Playwright tests to verify that routing works, that HTTP status codes (200 OK, 307 redirect, 404 NOT FOUND) are explicitly validated, and that real DOM elements render correctly across all features.
2. **Premise 2 (307 Status Code Verification Defect)**: When Playwright performs `await page.goto('/')`, it automatically follows HTTP 307 redirects to `/es`. Checking `response.status() === 200` validates the final landing page, but fails to test whether the middleware correctly returned an HTTP 307 status code vs. a 301, 302, or client-side JS meta-refresh.
3. **Premise 3 (Un-prefixed Route Gap)**: Un-prefixed routes (e.g. `/login`) are a primary root-cause surface area for 404 errors on Vercel deployments with `next-intl`. Omitting tests for un-prefixed route redirects leaves middleware functionality unvalidated in E2E testing.
4. **Premise 4 (Weak Locale Switching Assertion)**: Verifying only the `<select>` drop-down value when switching to Italian or Portuguese creates a false sense of security; if the application fails to fetch or render the Italian/Portuguese dictionary, the test still passes because it never asserts actual translated DOM content.
5. **Conclusion**: The test suite in `tests/e2e/` does not fully satisfy the mandatory requirements for HTTP status code verification (specifically 307 redirect checks) and robust DOM assertions. Therefore, the test harness must be **REJECTED** pending fixes.

---

## 3. Caveats

- **Execution Environment**: Shell command execution was blocked due to timeout on user permission prompt; verification was performed via comprehensive static analysis of Playwright test scripts, `playwright.config.ts`, `src/middleware.js`, `src/i18n/routing.js`, `messages/*.json`, and `src/app/` components.
- **Existing Strengths**: Existing DOM selector paths in `tier1-routing.spec.ts`, `tier2-boundary.spec.ts`, and `tier4-user-journey.spec.ts` accurately map to real DOM elements (`h1.glow-text`, `button[type="submit"]`, `input[type="email"]`, `table`, etc.).

---

## 4. Conclusion

**Verdict**: `REJECT`

The Playwright test harness in `tests/e2e/` contains clear assertion gaps:
1. Missing explicit HTTP 307 redirect status code assertions for root (`/`) and un-prefixed routes.
2. Missing test specs for un-prefixed route redirects (`/login`, `/hub`, `/f1`, `/profile`).
3. Weak DOM assertions in `tier3-locale-switch.spec.ts` for Italian (`it`) and Portuguese (`pt`).

### Recommended Remediation Steps:
1. **Add 307 Redirect Test Spec**: In `tier1-routing.spec.ts`, test `page.request.get('/', { maxRedirects: 0 })` or inspect `response.request().redirectedFrom()?.response()?.status()` to explicitly assert `307`.
2. **Add Un-prefixed Route Specs**: Test `page.goto('/login')` -> asserts URL `/es/login` and 307 redirect.
3. **Strengthen Italian/Portuguese DOM Assertions**: In `tier3-locale-switch.spec.ts`, assert submit button text or headers in Italian (`"Accedi"`) and Portuguese (`"Iniciar Sesión"` / localized string).

---

## 5. Verification Method

To verify these findings and validate future fixes:

1. **Inspect `tests/e2e/tier1-routing.spec.ts`**:
   - Verify if `307` status code is explicitly asserted via `request.get('/', { maxRedirects: 0 })` or `response.request().redirectedFrom()`.
2. **Inspect `tests/e2e/tier3-locale-switch.spec.ts`**:
   - Confirm whether DOM element text is asserted after switching to Italian and Portuguese.
3. **Execute E2E Test Command**:
   ```bash
   npx playwright test
   ```
