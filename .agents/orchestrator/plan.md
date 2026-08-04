# Project Execution Plan: Next.js 16 Middleware & Vercel Deployment Fix

## Project Goals
1. Resolve Vercel build failure by eliminating `src/middleware.js` and standardizing on `src/proxy.js` with `next-intl`.
2. Guarantee clean local production build (`npm run build` exits 0).
3. Implement and execute Playwright E2E tests against local production server (`npm run build` && `npm run start`).

---

## Milestone 1 (M1): Middleware Cleanup & Next.js 16 Build Fix

### Objective
Remove `src/middleware.js`, standardize `src/proxy.js` for Next.js 16 and `next-intl`, await `params` in `src/app/[locale]/layout.js`, and verify clean production compilation (`npm run build` exit code 0).

### Execution Steps
1. **Worker Dispatch (`teamwork_preview_worker`)**:
   - Delete `src/middleware.js`.
   - Verify `src/proxy.js` uses `createMiddleware(routing)` and matcher `['/((?!api|_next|_vercel|.*\\..*).*)']`.
   - Update `src/app/[locale]/layout.js` to await `params` (`const { locale } = await params`).
   - Execute `npm run build` and capture exit code and logs.
2. **Reviewer Dispatch (`teamwork_preview_reviewer` x2)**:
   - Verify codebase has no duplicate middleware/proxy files.
   - Verify Next.js 16 compliance and `next-intl` routing logic.
   - Verify `npm run build` runs and exits with 0.
3. **Challenger Dispatch (`teamwork_preview_challenger` x2)**:
   - Run production server (`npm run start` or `next start`) and test HTTP redirects/routing.
4. **Auditor Dispatch (`teamwork_preview_auditor`)**:
   - Perform forensic audit to verify genuine implementation without hardcoded bypasses or fake build scripts.
5. **Gate Check**:
   - Check build status, Reviewer APPROVE verdicts, Challenger tests, and Forensic Auditor CLEAN verdict.

---

## Milestone 2 (M2): Playwright E2E Test Suite & Production Verification

### Objective
Install `@playwright/test`, write Playwright E2E test specs, configure `playwright.config.ts` targeting production server (`npm run build` && `npm run start`), and pass all E2E tests.

### Execution Steps
1. **Worker Dispatch (`teamwork_preview_worker`)**:
   - Install `@playwright/test` and install browser binaries.
   - Create `playwright.config.ts` with local production webServer setup on port 3000.
   - Create `tests/e2e/routing.spec.ts` covering root redirection (`/` -> `/es`), locale routes (`/es`, `/en`), and page rendering without 404s.
   - Execute `npx playwright test` against the local production build.
2. **Reviewer Dispatch (`teamwork_preview_reviewer` x2)**:
   - Review Playwright configuration and test specs.
   - Verify test execution output and pass rate.
3. **Challenger Dispatch (`teamwork_preview_challenger` x2)**:
   - Run adversarial test scenarios (e.g. invalid locales, deep paths) to test routing edge cases.
4. **Auditor Dispatch (`teamwork_preview_auditor`)**:
   - Verify Playwright test suite is executed authentically against actual production server.
5. **Gate Check**:
   - Check test pass rate (100%), Reviewer APPROVE verdicts, Challenger tests, and Forensic Auditor CLEAN verdict.

---

## Final Verification & Completion Report
- Synthesize all gate verdicts into final completion report.
- Present report to the Sentinel.
