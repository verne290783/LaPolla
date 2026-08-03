# Project: La Polla Next.js 16 + next-intl Vercel Deployment & Playwright E2E

## Architecture
- Framework: Next.js 16.2.12 App Router (React 19)
- Internationalization: next-intl 4.13.4 with middleware/proxy locale routing (es, en, it, pt)
- Backend / Database: Supabase (`@supabase/supabase-js`)
- E2E Testing: Playwright (`@playwright/test`)
- Target Deployment: Vercel

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Middleware / Proxy Locale Routing | Fix middleware matcher regex and proxy configuration for un-prefixed routes (`/`, `/login`, `/hub`, etc.) | M1 | R1, R2 |
| 2 | App Router & Page Layout Fixes | Add `src/app/[locale]/login/page.js`, add root `src/app/page.js` redirect, await `params` in layout.js, add `generateStaticParams()` | M1 | R1, R2 |
| 3 | i18n Navigation & Links | Configure `routing.js`, `navigation.js`, and update components to use locale-aware navigation | M1 | R1, R2 |
| 4 | Playwright Test Harness & Config | Add `@playwright/test`, `playwright.config.ts`, `npm run test:e2e` script | M2 | R3 |
| 5 | E2E Test Suite (Tiers 1-4) | Write Playwright tests verifying root redirect, `/es/login`, routing, locale switching, and user scenarios | M2 | R3 |
| 6 | Production Build & E2E Validation | Run `npm run build && npm run start` and `npx playwright test` passing 100% | M3 | Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Next.js 16 & i18n Fixes | Fix middleware matcher / proxy.js, add missing `/es/login` page, root page redirect, async `params` in RootLayout, and `generateStaticParams()` | none | DONE |
| 2 | M2: E2E Test Suite Creation | Install Playwright, configure `playwright.config.ts`, write Tiers 1-4 E2E test specs | M1 | DONE |
| 3 | M3: Final E2E Validation & Hardening | Run local production server, execute 100% passing Playwright tests, adversarial hardening | M1, M2 | DONE |

## Interface Contracts
### Middleware / Proxy ↔ App Router
- Matcher: `['/((?!api|_next|_vercel|.*\\..*).*)']`
- Locales: `['es', 'en', 'it', 'pt']`, Default: `'es'`
- Root `/` redirect: 307 to `/[locale]` (`/es`)
- Un-prefixed routes (e.g. `/login`): 307 redirect to `/es/login`

### Layout ↔ Page Params (Next.js 16)
- `RootLayout`: `export default async function RootLayout({ children, params }) { const { locale } = await params; ... }`
- Static Params: `export function generateStaticParams() { return [{ locale: 'es' }, { locale: 'en' }, { locale: 'it' }, { locale: 'pt' }]; }`

## Code Layout
- `src/middleware.js` / `src/proxy.js`: Locale routing middleware
- `src/i18n/routing.js`: next-intl routing configuration
- `src/i18n/navigation.js`: next-intl navigation hooks and Link component
- `src/app/page.js`: Root redirect fallback to `/es`
- `src/app/[locale]/layout.js`: Root locale layout
- `src/app/[locale]/page.js`: Locale landing / login page
- `src/app/[locale]/login/page.js`: Locale login page (`/es/login`)
- `playwright.config.ts`: Playwright E2E configuration
- `tests/e2e/`: E2E test suite specs
