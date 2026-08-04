# Project: La Polla - Next.js 16 Middleware & Vercel Fix

## Architecture
- Next.js 16.2.12 App Router (`src/app/[locale]/...`)
- `next-intl` 4.13.4 for internationalization routing (`es`, `en`, `it`, `pt`)
- `proxy.js` standard Next.js 16 request routing handler (`src/proxy.js`)
- Playwright E2E test runner (`playwright.config.ts`, `tests/e2e/`)

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Middleware Conflict Resolution | Eliminate duplicate `src/middleware.js`, use sole `src/proxy.js` handler | M1 | Survey |
| 2 | Next.js 16 Routing & Build Compliance | Ensure `npm run build` exits 0 with zero compilation/middleware errors | M1 | Survey |
| 3 | Root Redirection & Locale Routing | `/` redirects to `/es`, all locale routes return 200 OK without 404 | M1 | Survey |
| 4 | Playwright E2E Test Infra | Setup `@playwright/test` and `playwright.config.ts` targeting local prod server | M2 | Survey |
| 5 | E2E Test Verification | Run Playwright test suite against production build ensuring 100% pass rate | M2 | Survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Middleware Cleanup & Next.js 16 Build Fix | Delete `src/middleware.js`, standardize `src/proxy.js`, fix Next.js 16 async params in layout if needed, verify `npm run build` exit code 0 | None | DONE |
| M2 | Playwright E2E Test Suite & Prod Pass | Install `@playwright/test`, write E2E tests for routing/pages, run `npx playwright test` on production build | M1 | DONE |

## Interface Contracts
### `src/proxy.js`
- Export default: `createMiddleware(routing)` from `next-intl/middleware`
- Export config: `matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']`
- File location: `src/proxy.js` ONLY (`src/middleware.js` MUST NOT EXIST)

### `src/app/[locale]/layout.js`
- Function signature: `export default async function RootLayout({ children, params })`
- `params` MUST be awaited before destructuring: `const { locale } = await params;`

## Code Layout
- `src/proxy.js`: Standard Next.js 16 request interceptor handler
- `src/app/[locale]/`: App router pages (`page.js`, `layout.js`, `hub/page.js`, `f1/page.js`, etc.)
- `src/i18n/`: `routing.js`, `request.js`
- `tests/e2e/`: Playwright E2E spec files (`routing.spec.ts`, `app.spec.ts`)
- `playwright.config.ts`: Playwright configuration for production build testing
