# 5-Component Handoff Report: Middleware & i18n Survey

## 1. Observation

1. **`src/middleware.js` Matcher**:
   - Path: `src/middleware.js:8-10`
   - Content:
     ```javascript
     export const config = {
       matcher: ['/', '/(es|en|it|pt)/:path*']
     };
     ```
   - Observation: Matcher array contains only `'/'` and `'/(es|en|it|pt)/:path*'`. Requests to un-prefixed routes like `/login`, `/hub`, `/f1`, `/leaderboard`, `/profile` are not matched.

2. **App Router Route Inventory**:
   - Path: `src/app/`
   - Files observed:
     - `src/app/[locale]/layout.js`
     - `src/app/[locale]/page.js` (`LoginPage`)
     - `src/app/[locale]/hub/page.js` (`HubPage`)
     - `src/app/[locale]/f1/page.js` (`F1Page`)
     - `src/app/[locale]/leaderboard/page.js` (`LeaderboardPage`)
     - `src/app/[locale]/profile/page.js` (`ProfilePage`)
   - Observation: `src/app/[locale]/login/page.js` DOES NOT EXIST. The root `src/app/[locale]/page.js` renders `LoginPage`. Any request to `/es/login` has no matching route handler.

3. **Next.js 16 Asynchronous `params` in `RootLayout`**:
   - Path: `src/app/[locale]/layout.js:21`
   - Content:
     ```javascript
     export default async function RootLayout({ children, params: { locale } }) {
     ```
   - Observation: `params` is destructured synchronously as `{ locale }` in function parameters. In Next.js 16 (React 19), `params` is a Promise and must be awaited (`const { locale } = await params`).

4. **Missing `generateStaticParams()`**:
   - Path: `src/app/[locale]/layout.js`
   - Observation: `generateStaticParams()` is not exported from `layout.js` or `page.js`.

5. **`next/link` Usage in Components**:
   - Path: `src/app/[locale]/f1/page.js:15`, `src/app/[locale]/hub/page.js:18`, `src/app/[locale]/leaderboard/page.js:23`, `src/app/[locale]/profile/page.js:16`
   - Observation: Components use `import Link from 'next/link'` with un-prefixed hrefs (`/hub`, `/f1`).

6. **`getRequestConfig` Signature**:
   - Path: `src/i18n/request.js:6`
   - Content:
     ```javascript
     export default getRequestConfig(async ({locale}) => {
     ```
   - Observation: `getRequestConfig` uses `{locale}` directly instead of `await requestLocale` recommended for Next.js 15/16 + `next-intl` v4+.

---

## 2. Logic Chain

1. **Step 1 (From Observation 1)**: `src/middleware.js` has matcher `['/', '/(es|en|it|pt)/:path*']`.
   - *Reasoning*: Any request to un-prefixed paths like `/login` or `/hub` does not match the matcher. Next.js bypasses middleware execution completely for these requests.

2. **Step 2 (From Step 1 & Observation 2)**: Because middleware is bypassed for `/login` or `/hub`, Next.js tries to resolve `/login` or `/hub` directly against `src/app/login/page.js` or `src/app/hub/page.js`.
   - *Reasoning*: All pages in the app are located inside `src/app/[locale]/...`. Thus `src/app/login/page.js` does not exist, causing Next.js to return a **404 NOT FOUND**.

3. **Step 3 (From Observation 2)**: A request to `/es/login` reaches Next.js, but there is no `src/app/[locale]/login/page.js` file.
   - *Reasoning*: `src/app/[locale]/page.js` serves `/[locale]` (e.g. `/es`). Without a `login` subfolder under `src/app/[locale]/`, `/es/login` returns a **404 NOT FOUND**.

4. **Step 4 (From Observation 3 & 4)**: Synchronous destructuring of `params: { locale }` in `RootLayout` causes Next.js 16 to throw a runtime error (`params should be awaited`). Missing `generateStaticParams()` prevents static pre-rendering of locale parameters during `next build`.
   - *Reasoning*: During production build or Vercel SSR/ISR, layout rendering fails or falls back to error/404 handling.

5. **Step 5 (From Observation 5)**: Using `next/link` with hardcoded un-prefixed hrefs (`href="/hub"`) triggers client-side navigation to `/hub`.
   - *Reasoning*: Because `/hub` is not caught by middleware (Step 1), client navigation to `/hub` triggers a 404 instead of adding the locale prefix.

6. **Conclusion (Synthesized from Steps 1-5)**: Fixing the middleware matcher, implementing `routing.js` / `navigation.js`, adding `src/app/[locale]/login/page.js`, awaiting `params` in `RootLayout`, exporting `generateStaticParams()`, and updating links will resolve all 404 errors in production and Vercel.

---

## 3. Caveats

- **No Source Code Edits Made**: As per explorer role constraints, no source code files outside `.agents/explorer_survey_2` were modified.
- **Production Build Testing Pending**: Verifying the build and running Playwright tests requires the implementer agent to apply the code changes and execute `npm run build` and `npx playwright test`.

---

## 4. Conclusion

The 404 NOT_FOUND errors in production/Vercel are caused by:
1. Middleware matcher skipping un-prefixed routes (`/login`, `/hub`, `/f1`, etc.).
2. Missing `src/app/[locale]/login/page.js` route for `/es/login`.
3. Un-awaited `params` in Next.js 16 `RootLayout`.
4. Missing `generateStaticParams()` in `[locale]/layout.js`.
5. Hardcoded un-prefixed links in navigation.

Configuring `src/i18n/routing.js`, `src/i18n/navigation.js`, `src/middleware.js` with negative lookahead matcher, `src/app/[locale]/login/page.js`, and awaiting `params` in `layout.js` completely resolves all 404 issues.

---

## 5. Verification Method

To independently verify the diagnosis and proposed resolution:

1. **Inspect Code Locations**:
   - `src/middleware.js`: Check matcher definition.
   - `src/app/[locale]/layout.js`: Check `params` destructuring signature.
   - `src/app/`: Confirm absence of `[locale]/login/page.js`.

2. **Execute Build & Test Commands**:
   - Run `npm run build` locally. Verify that routes `/[locale]`, `/[locale]/login`, `/[locale]/hub`, `/[locale]/f1`, `/[locale]/leaderboard`, `/[locale]/profile` are generated without errors.
   - Run `npm run start` to start the production server locally on port 3000.
   - Verify HTTP responses using curl or browser:
     - `curl -I http://localhost:3000/` -> Expect `307 Temporary Redirect` to `/es`
     - `curl -I http://localhost:3000/es` -> Expect `200 OK`
     - `curl -I http://localhost:3000/es/login` -> Expect `200 OK`
     - `curl -I http://localhost:3000/login` -> Expect `307 Temporary Redirect` to `/es/login` or `/es`
     - `curl -I http://localhost:3000/hub` -> Expect `307 Temporary Redirect` to `/es/hub`
   - Run Playwright test suite (`npx playwright test`).

3. **Invalidation Conditions**:
   - If `GET /` returns a 404 instead of a 307 redirect, middleware matcher or `next-intl` configuration is invalid.
   - If `GET /es/login` returns a 404, `src/app/[locale]/login/page.js` is missing or routing is misconfigured.
