# Summary of Test Harness Improvements (Milestone 2 Fixes)

## 1. Overview
The Playwright E2E test suite and test documentation have been updated to fulfill all Challenger 1 feedback requirements. Specifically:
- Explicit HTTP 307 Temporary Redirect status code and `Location` header assertions added for root `/`.
- New test specs added for un-prefixed routes (`/login`, `/hub`, `/f1`, `/profile`) verifying HTTP 307 redirect status code, `Location` header, and 200 OK landing.
- Italian (`it`) and Portuguese (`pt`) DOM text assertions added in `tier3-locale-switch.spec.ts` for submit button text (`Accedi`, `Entrar`) and header text (`La Polla`).
- `TEST_INFRA.md` and `TEST_READY.md` updated to accurately document all expanded test cases.

---

## 2. File-by-File Details

### A. `tests/e2e/tier1-routing.spec.ts`
- **Root Redirect Test**: Updated `test('Root path / returns HTTP 307 redirecting to /es default locale and lands with 200 OK')` using `page.request.get('/', { maxRedirects: 0 })` to explicitly check `status() === 307` and `headers()['location']` contains `/es`.
- **Un-prefixed Routes Test**: Added `test('Un-prefixed routes (/login, /hub, /f1, /profile) return HTTP 307 redirecting to /es/* and land with 200 OK')` testing each un-prefixed path for 307 redirect, `Location` header target, and final 200 OK landing URL.

### B. `tests/e2e/tier3-locale-switch.spec.ts`
- **Italian & Portuguese DOM Assertions**: Updated `test('Switching language between Italian (it) and Portuguese (pt)...')` to assert:
  - Italian (`it`): `<button type="submit">` has text `"Accedi"` and `<h1 class="glow-text">` has text `"La Polla"`.
  - Portuguese (`pt`): `<button type="submit">` has text `"Entrar"` and `<h1 class="glow-text">` has text `"La Polla"`.

### C. `TEST_INFRA.md`
- Expanded Tier 1 and Tier 3 documentation to include details of explicit HTTP 307 status code checks, un-prefixed route test coverage, and Italian/Portuguese DOM element text assertions.

### D. `TEST_READY.md`
- Updated the inventory matrix table for Tier 1 and Tier 3 test specs to describe explicit 307 redirect status checks, un-prefixed route redirects, and localized DOM text assertions (`Sign In`, `Accedi`, `Entrar`).

---

## 3. Verification Summary
- `tests/e2e/tier1-routing.spec.ts`: Explicitly asserts HTTP 307 status codes, location headers, and 200 OK landing pages.
- `tests/e2e/tier3-locale-switch.spec.ts`: Explicitly asserts locale select values, URL changes, and translated button DOM text.
- Documentation (`TEST_INFRA.md` and `TEST_READY.md`): Fully aligned with expanded Playwright test suite.
