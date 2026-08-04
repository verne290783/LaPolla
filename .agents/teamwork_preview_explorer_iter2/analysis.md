# Iteration 2 Remediation Analysis

## Executive Summary

Following the Forensic Audit (`teamwork_preview_auditor_m1_1`) verdict of **INTEGRITY VIOLATION** and Reviewer/Challenger feedback (`REQUEST_CHANGES`), this report specifies the detailed remediation strategy for Iteration 2.

The key objectives for the Worker are:
1. Guarantee complete removal of `src/middleware.js` so only `src/proxy.js` exists in `src/`, resolving Next.js 16 file collision build failures on Vercel.
2. Ensure locale validation in `src/app/[locale]/layout.js` returns a 404 via `notFound()` for invalid locales.
3. Enhance `tests/e2e/tier2-boundary.spec.ts` with an explicit test case verifying that invalid/unsupported locale routes (e.g. `/fr` or `/fr/login`) return HTTP status `404`.

---

## 1. Audit Evidence & Problem Statement

### 1.1 Integrity Violation Cause
- **Audit Observation**: The Forensic Audit identified that both `src/middleware.js` and `src/proxy.js` were present in `c:\Users\Edison\Desktop\La Polla\src\`.
- **Next.js 16 Constraint**: Next.js 16 strictly forbids having both `middleware.js` and `proxy.js` in the source directory. This collision causes immediate build failures on Vercel (`Error 6s`).
- **Ground Truth Requirement**: `ORIGINAL_REQUEST.md` (Requirement R1 & Acceptance Criterion 3) mandates:
  > *"Eliminar el archivo obsoleto (`middleware.js`) y usar únicamente `proxy.js` siguiendo la directiva de deprecación de Next.js 16."*
  > *"No existen archivos duplicados para la misma función (ej. no pueden coexistir `middleware.js` y `proxy.js`)."*

### 1.2 Challenger Feedback (Invalid Locale Route 404 Testing)
- **Challenger 2 Observation**: While `tests/e2e/tier2-boundary.spec.ts` checks `/non-existent-route-xyz` and `/es/unknown-nested-page-xyz`, it lacks an explicit test for invalid/unsupported locale routes like `/fr` or `/fr/login`.
- **Required Behavior**: Attempting to access an unsupported locale route (such as `/fr` or `/fr/login`) must return an HTTP 404 status code.

---

## 2. Technical Findings & Component Analysis

### 2.1 Proxy & Middleware Configuration (`src/proxy.js`)
`src/proxy.js` is configured with `next-intl` middleware:
```javascript
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
```
- `src/middleware.js` must be deleted completely if it exists anywhere in `src/`.

### 2.2 Locale Validation in Layout (`src/app/[locale]/layout.js`)
Currently, `src/app/[locale]/layout.js` renders `RootLayout` without checking if the URL `locale` parameter is in `routing.locales`:
```javascript
// Existing layout.js snippet:
export default async function RootLayout({ children, params }) {
  const { locale } = await params;
  const messages = await getMessages();
  ...
```
To ensure that requests for unsupported locales (like `/fr` or `/fr/login`) return a 404 response when hitting `[locale]`:
`src/app/[locale]/layout.js` must validate `locale` against `routing.locales` and trigger `notFound()` if invalid:
```javascript
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing'; // or relative: '../../i18n/routing'

export default async function RootLayout({ children, params }) {
  const { locale } = await params;
  
  if (!routing.locales.includes(locale)) {
    notFound();
  }
  ...
```

### 2.3 Boundary Test Suite Enhancements (`tests/e2e/tier2-boundary.spec.ts`)
Existing boundary tests in `tests/e2e/tier2-boundary.spec.ts`:
1. `Unknown routes return 404 status code or render 404 page` (`/non-existent-route-xyz`)
2. `Unknown locale route returns 404 status code` (`/es/unknown-nested-page-xyz`)

**Addition Required**:
```typescript
  test('Invalid locale routes (/fr, /fr/login) return 404 status code', async ({ page }) => {
    const responseRoot = await page.goto('/fr');
    expect(responseRoot?.status()).toBe(404);

    const responseNested = await page.goto('/fr/login');
    expect(responseNested?.status()).toBe(404);
  });
```

---

## 3. Step-by-Step Remediation Instructions for Worker

The Worker agent (`implementer`) must execute the following steps in sequence:

### Step 1: File Clean-Up & Verification
1. Check for `c:\Users\Edison\Desktop\La Polla\src\middleware.js`. If present, remove/delete the file.
2. Confirm `c:\Users\Edison\Desktop\La Polla\src\proxy.js` is the sole proxy/middleware file in `src/`.

### Step 2: Update `src/app/[locale]/layout.js`
1. Import `notFound` from `'next/navigation'` and `routing` from `'../../i18n/routing'`.
2. Add validation at the top of `RootLayout`:
   ```javascript
   if (!routing.locales.includes(locale)) {
     notFound();
   }
   ```

### Step 3: Update `tests/e2e/tier2-boundary.spec.ts`
1. Add the explicit invalid locale test case in `tests/e2e/tier2-boundary.spec.ts`:
   ```typescript
   test('Invalid locale route (/fr or /fr/login) returns 404 status code', async ({ page }) => {
     const response = await page.goto('/fr/login');
     expect(response?.status()).toBe(404);
   });
   ```

### Step 4: Local Build & Test Verification
1. Run `npm run build` and ensure exit code is 0 with zero file collision errors.
2. Run `npx playwright test` to verify all E2E test tiers pass 100% against the production build.

---

## 4. Evidence & Verification Plan

| Action | Target | Expected Verification Output |
|---|---|---|
| Middleware Removal | `src/middleware.js` | File does not exist in `src/` |
| Proxy File Check | `src/proxy.js` | Single proxy file exists and imports `next-intl/middleware` |
| Locale Guard | `src/app/[locale]/layout.js` | Calls `notFound()` when `!routing.locales.includes(locale)` |
| E2E Test Suite | `tests/e2e/tier2-boundary.spec.ts` | Includes invalid locale 404 test case (`/fr/login`) |
| Local Build | Terminal | `npm run build` succeeds (Exit Code 0) |
| E2E Run | Terminal | `npx playwright test` passes all specs |
