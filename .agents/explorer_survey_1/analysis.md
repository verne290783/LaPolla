# Survey Phase Analysis Report — Codebase & Vercel Config Explorer

## Executive Summary
This analysis investigates the configuration, route layout, dependencies, and Next.js 16 documentation to identify the root cause of the 404 NOT_FOUND error occurring on Vercel deployments. The primary issue is a incompatibility between Next.js 16 breaking changes (where `middleware.js` is deprecated and renamed to `proxy.js`) and the project's current middleware setup (`src/middleware.js`), compounded by the lack of a root page fallback redirect (`src/app/page.js`) when accessing `/`.

---

## 1. Project Configuration & File Layout

### 1.1 Dependency & Version Inventory (`package.json`)
- **Next.js**: `16.2.12` (`package.json:13`)
- **next-intl**: `^4.13.4` (`package.json:14`)
- **React / React-DOM**: `19.2.4` (`package.json:15-16`)
- **@supabase/supabase-js**: `^2.112.0` (`package.json:12`)
- **ESLint / Config**: `^9` / `16.2.12` (`package.json:19-20`)

### 1.2 Configuration Files
- `next.config.mjs`:
  ```javascript
  import createNextIntlPlugin from 'next-intl/plugin';
  const withNextIntl = createNextIntlPlugin();
  const nextConfig = {};
  export default withNextIntl(nextConfig);
  ```
  - Located at project root (`next.config.mjs:1-9`).
- `jsconfig.json`: Alias `@/*` mapped to `./src/*` (`jsconfig.json:4`).
- `vercel.json`: **NOT PRESENT** in project root or subdirectories.

### 1.3 Project Directory Layout & App Router Routes
The application uses App Router under `src/app`:
```
src/
├── app/
│   ├── [locale]/
│   │   ├── f1/
│   │   │   ├── f1.module.css
│   │   │   └── page.js
│   │   ├── hub/
│   │   │   ├── hub.module.css
│   │   │   └── page.js
│   │   ├── leaderboard/
│   │   │   ├── leaderboard.module.css
│   │   │   └── page.js
│   │   ├── profile/
│   │   │   ├── page.js
│   │   │   └── profile.module.css
│   │   ├── layout.js
│   │   └── page.js              <-- Login page component
│   ├── favicon.ico
│   ├── globals.css
│   └── page.module.css
├── components/
│   ├── LanguageSelector.js
│   ├── LoginForm.js
│   └── login.module.css
├── i18n/
│   └── request.js
└── middleware.js               <-- Legacy middleware naming
```

---

## 2. Root Cause Analysis of 404 NOT_FOUND on Vercel

### Primary Cause: Next.js 16 `middleware` Deprecation and Renaming to `proxy`
- **Evidence**:
  In `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`:
  - **Line 11**: `> **Note**: The middleware file convention is deprecated and has been renamed to proxy.`
  - **Line 773**: `v16.0.0: Middleware is deprecated and renamed to Proxy. Proxy defaults to the Node.js runtime.`
  - **Line 763**: `middleware.ts -> proxy.ts` / `middleware.js -> proxy.js`
- **Impact**:
  The project currently names the file `src/middleware.js` (`src/middleware.js:1-11`) exporting `default createMiddleware(...)`. In Next.js 16, Next.js expects `src/proxy.js` (or `proxy.js`) exporting a `proxy` function or default `proxy`. As a result, `src/middleware.js` is not recognized or executed by Next.js 16 in Vercel production deployment.

### Secondary Cause: Absence of Root `src/app/page.js` Route Handler
- **Evidence**:
  `src/app/` contains `[locale]/`, but does **NOT** contain `src/app/page.js`.
- **Impact**:
  When a user requests the root URL `/` on Vercel:
  1. Without active proxy execution (due to the `middleware.js` vs `proxy.js` mismatch), Next.js attempts to serve the root route `/` directly from `src/app/`.
  2. Because there is no `src/app/page.js`, Next.js cannot find a matching route segment and returns `404 NOT_FOUND`.

### Tertiary Cause: Synchronous `params` Access in `src/app/[locale]/layout.js`
- **Evidence**:
  In `src/app/[locale]/layout.js` (line 21):
  `export default async function RootLayout({ children, params: { locale } })`
- **Impact**:
  In Next.js 16 (as documented in `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/layout.md`, lines 60-90), `params` is a `Promise`. Synchronous destructuring of `params: { locale }` in function arguments will yield `undefined` for `locale` during Server Component rendering or build.

---

## 3. Next.js 16 Breaking Changes & Conventions Summary

From official documentation in `node_modules/next/dist/docs/`:

1. **Middleware -> Proxy Migration**:
   - File location: `src/proxy.js` (or `proxy.js` at root).
   - Function export: `export function proxy(request) { ... }` or `export default function proxy(request) { ... }`.
   - Codemod: `npx @next/codemod@canary middleware-to-proxy .`
2. **Async `params` in App Router**:
   - `params` in `layout.js` and `page.js` is a `Promise`:
     ```javascript
     export default async function RootLayout({ children, params }) {
       const { locale } = await params;
       ...
     }
     ```
3. **Root Page Fallback / Redirect**:
   - A root redirect page `src/app/page.js` using `redirect('/es')` ensures that requests reaching `/` directly (bypassing or prior to proxy execution) are cleanly redirected to the default locale (`/es`).

---

## 4. Proposed Fix Strategy for Next Stage (Implementer)

1. **Rename & Update Middleware to Proxy**:
   - Rename `src/middleware.js` -> `src/proxy.js`.
   - Update export to align with Next.js 16 proxy convention (`export function proxy(request)` or `export default createMiddleware(...)`).
2. **Add Root Fallback Route `src/app/page.js`**:
   - Create `src/app/page.js` with `redirect('/es')` from `next/navigation`.
3. **Update `src/app/[locale]/layout.js`**:
   - Await `params` in `RootLayout` (`const { locale } = await params`).
4. **Setup Playwright E2E Tests**:
   - Install `@playwright/test` and configure `playwright.config.js`.
   - Write tests verifying root redirect `/` -> `/es` and page load of `/es`.
