# Technical Analysis: Next.js 16 Middleware vs Proxy Conflict

## Executive Summary
In Next.js 16 (`16.2.12`), the legacy `middleware.js|ts` file convention was officially deprecated and replaced with `proxy.js|ts` to better reflect its role as a network boundary proxy before application rendering.

During a previous iteration, both `src/middleware.js` and `src/proxy.js` were present in the codebase. Coexistence of both files causes a fatal conflict during `next build`, leading directly to Vercel deployment failures.

---

## 1. Examination of `src/middleware.js` and `src/proxy.js`

### `src/middleware.js` Content
```javascript
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
```

### `src/proxy.js` Content
```javascript
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
```

Both files are identical in implementation and configuration.

---

## 2. Root Cause of Build Failure in Next.js 16

1. **Next.js 16 Convention Shift**: Next.js 16 deprecated `middleware.js` in favor of `proxy.js` (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`).
2. **Single Entry Point Enforcement**: Next.js enforces a strict single-proxy file policy per project. Having both `src/middleware.js` and `src/proxy.js` introduces duplicate and conflicting request interceptor entry points.
3. **Vercel Build Failure**: When `next build` is executed, Next.js detects duplicate middleware/proxy handlers and throws a fatal build error, failing Vercel deployments within seconds.

---

## 3. Compatibility of `next-intl` with `proxy.js`

- `createMiddleware(routing)` from `next-intl/middleware` returns a function `(request) => NextResponse`.
- Next.js 16 `proxy.js` supports exporting this function as `export default` or named `export function proxy`.
- Therefore, `export default createMiddleware(routing)` in `src/proxy.js` is fully compatible with Next.js 16.

---

## 4. Recommended Action Plan / Strategy

1. **Delete `src/middleware.js`**: Remove the obsolete `src/middleware.js` file from the project.
2. **Keep `src/proxy.js`**: Retain `src/proxy.js` as the sole request handler for internationalized routing.
3. **Verify Build**: Run `npm run build` to confirm a clean build with exit code 0.
4. **Verify E2E Tests**: Run `npx playwright test` against the production server build to ensure locale redirection (`/` -> `/es/login`) functions properly.
