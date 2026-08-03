# Technical Analysis & Implementation Blueprint for Milestone 1

## Overview
This document provides the exact code specifications, rationale, file structures, and code diffs required to implement **Milestone 1: Next.js 16 & i18n Fixes**.

---

## Specification 1: Proxy / Middleware Configuration (`src/proxy.js` & `src/middleware.js`)

### Background & Next.js 16 Convention
In Next.js 16.0.0+, the `middleware` convention was officially deprecated and renamed to `proxy`. 
The proxy runner looks for `src/proxy.js` (or `proxy.js` at project root). To guarantee 100% compatibility across Next.js 16 local builds and Vercel edge/serverless deployments, both `src/proxy.js` and `src/middleware.js` should be configured.

### Exact Implementation

#### 1. `src/proxy.js` (New File)
```javascript
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
```

#### 2. `src/middleware.js` (Update existing)
```javascript
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
```

### Matcher Rationale
- Old matcher: `['/', '/(es|en|it|pt)/:path*']` — Failed to match un-prefixed routes such as `/login`, `/hub`, `/f1`, `/leaderboard`, `/profile`.
- New matcher: `['/((?!api|_next|_vercel|.*\\..*).*)']` — Captures all incoming HTTP requests EXCEPT static assets (`/_next`, `/_vercel`, files with extensions like `.png`, `.ico`, `.css`) and API routes (`/api`).
- Behavior: Un-prefixed routes like `/login` or `/hub` are intercepted and redirected with HTTP 307 to `/es/login` or `/es/hub`.

---

## Specification 2: Creation of `src/app/[locale]/login/page.js`

### Background
Currently, `/es` renders `src/app/[locale]/page.js` (`LoginPage`). However, when users or direct links navigate to `/es/login`, Next.js checks `src/app/[locale]/login/page.js`. Because this file was missing, `/es/login` returned a `404 NOT_FOUND` error.

### Exact Implementation
Create `src/app/[locale]/login/page.js`:

```javascript
import LoginPage from '../page';

export default LoginPage;
```

### Expected Behavior
- Request to `GET /es/login` -> Resolves `src/app/[locale]/login/page.js` -> Renders `LoginPage` -> HTTP 200 OK.

---

## Specification 3: Creation of Root Fallback `src/app/page.js`

### Background
If middleware or proxy is bypassed or during static site generation on Vercel, requests reaching the root `/` path without locale prefix require a server-side redirect handler.

### Exact Implementation
Create `src/app/page.js`:

```javascript
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/es');
}
```

### Expected Behavior
- Request to `GET /` (if bypassing proxy/middleware) -> Resolves `src/app/page.js` -> Server-side redirect to `/es` (HTTP 307/308).

---

## Specification 4: Root Layout (`src/app/[locale]/layout.js`) Fixes

### Background
1. In Next.js 16 (React 19), route `params` is an asynchronous Promise. Destructuring `params: { locale }` synchronously in function arguments causes `locale` to be `undefined` or throws runtime warnings/errors.
2. `generateStaticParams()` was missing, preventing Next.js from pre-building static pages for supported locales (`es`, `en`, `it`, `pt`).

### Code Diff (`src/app/[locale]/layout.js`)

```diff
  import { Geist, Geist_Mono } from "next/font/google";
  import { NextIntlClientProvider } from 'next-intl';
  import { getMessages } from 'next-intl/server';
  import "../globals.css";

  const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
  });

  const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
  });

  export const metadata = {
    title: "La Polla | Elite Prediction Club",
    description: "Premium Multi-Event Predictions",
  };

+ export function generateStaticParams() {
+   return [
+     { locale: 'es' },
+     { locale: 'en' },
+     { locale: 'it' },
+     { locale: 'pt' }
+   ];
+ }

- export default async function RootLayout({ children, params: { locale } }) {
+ export default async function RootLayout({ children, params }) {
+   const { locale } = await params;
    const messages = await getMessages();
    
    return (
      <html lang={locale} className={`${geistSans.variable} ${geistMono.variable}`}>
        <body>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </body>
      </html>
    );
  }
```

---

## Specification 5: i18n Configuration & Navigation Components

### 1. `src/i18n/routing.js` (New File)
```javascript
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['es', 'en', 'it', 'pt'],
  defaultLocale: 'es'
});
```

### 2. `src/i18n/navigation.js` (New File)
```javascript
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
```

### 3. `src/i18n/request.js` (Update existing)
```javascript
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
```

### 4. `src/components/LanguageSelector.js` (Refactor)
```javascript
'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

export default function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (e) => {
    const nextLocale = e.target.value;
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <select 
      value={locale} 
      onChange={handleLanguageChange}
      style={{
        background: 'rgba(0,0,0,0.5)',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '20px',
        padding: '5px 10px',
        cursor: 'pointer'
      }}
    >
      <option value="es">Español</option>
      <option value="en">English</option>
      <option value="it">Italiano</option>
      <option value="pt">Português</option>
    </select>
  );
}
```

### 5. Locale-Aware Links in Navigation Components
Replace `import Link from 'next/link'` with `import { Link } from '@/i18n/navigation'` in:
- `src/app/[locale]/hub/page.js`
- `src/app/[locale]/f1/page.js`
- `src/app/[locale]/leaderboard/page.js`
- `src/app/[locale]/profile/page.js`

---

## File Operations Checklist for Worker M1

| File Path | Action | Description |
|-----------|--------|-------------|
| `src/i18n/routing.js` | CREATE | Export `routing` via `defineRouting` |
| `src/i18n/navigation.js` | CREATE | Export `Link`, `redirect`, `usePathname`, `useRouter` via `createNavigation(routing)` |
| `src/i18n/request.js` | MODIFY | Update `getRequestConfig` to await `requestLocale` & validate against `routing.locales` |
| `src/proxy.js` | CREATE | Implement Next.js 16 proxy with `next-intl` middleware and matcher `['/((?!api\|_next\|_vercel\|.*\\..*).*)']` |
| `src/middleware.js` | MODIFY | Synchronize with `proxy.js` configuration |
| `src/app/page.js` | CREATE | Root fallback redirecting `/` to `/es` |
| `src/app/[locale]/login/page.js` | CREATE | Route handler for `/es/login` delegating to `LoginPage` |
| `src/app/[locale]/layout.js` | MODIFY | Await `params` in `RootLayout` and export `generateStaticParams()` |
| `src/components/LanguageSelector.js` | MODIFY | Refactor language selector using `useRouter`/`usePathname` from `@/i18n/navigation` |
| `src/app/[locale]/hub/page.js` | MODIFY | Use `Link` from `@/i18n/navigation` |
| `src/app/[locale]/f1/page.js` | MODIFY | Use `Link` from `@/i18n/navigation` |
| `src/app/[locale]/leaderboard/page.js` | MODIFY | Use `Link` from `@/i18n/navigation` |
| `src/app/[locale]/profile/page.js` | MODIFY | Use `Link` from `@/i18n/navigation` |
