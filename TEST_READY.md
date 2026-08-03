# Playwright E2E Test Suite Readiness (`TEST_READY.md`)

## 1. Infrastructure Readiness Checklist

- [x] **Package Dependency**: `@playwright/test` (`^1.49.1`) added to `devDependencies` in `package.json`.
- [x] **NPM Script**: `"test:e2e": "playwright test"` registered in `package.json`.
- [x] **Configuration**: `playwright.config.ts` created at project root with `webServer` configured (`npm run build && npm run start`, `http://localhost:3000`, 120s timeout).
- [x] **Browser Binaries**: Chromium browser target configured for Playwright execution.

---

## 2. Test Suite Inventory & Matrix

| Tier | Spec File | Purpose & Verification Scope | Status |
|------|-----------|------------------------------|--------|
| Tier 1 | `tests/e2e/tier1-routing.spec.ts` | Validates HTTP 307 redirects and Location headers for root `/` and un-prefixed routes (`/login`, `/hub`, `/f1`, `/profile`), and 200 OK for `/es/login`, `/es/hub`, `/es/f1`, `/es/leaderboard`, `/es/profile`, `/en`, `/it`, `/pt`. | READY |
| Tier 2 | `tests/e2e/tier2-boundary.spec.ts` | Validates 404 response on unknown routes (`/non-existent-route-xyz`), required form input attributes, and login submission success state. | READY |
| Tier 3 | `tests/e2e/tier3-locale-switch.spec.ts` | Validates client-side `LanguageSelector` dropdown switching between `es`, `en`, `it`, `pt`, updating URL and localized DOM text (`Sign In`, `Accedi`, `Entrar`). | READY |
| Tier 4 | `tests/e2e/tier4-user-journey.spec.ts` | Validates complete user flow: landing, locale switch, login submission, and navigation across main pages. | READY |

---

## 3. Execution & Verification Instructions

### How to Run:
```bash
npm run test:e2e
```

### Expected Output:
- Production Next.js build created (`.next`) and started on port 3000.
- 100% passing tests across all 4 test spec files.
- Zero 404 NOT_FOUND HTTP errors on valid application routes.
