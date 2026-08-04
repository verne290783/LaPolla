import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/proxy';
import { NextResponse } from 'next/server';

const handleRouting = createMiddleware(routing);

export default async function proxy(request) {
  // 1. Execute next-intl middleware for locale routing
  const intlResponse = handleRouting(request);

  // 2. Update/refresh Supabase auth session
  const { supabaseResponse, user } = await updateSession(request, intlResponse);

  // 3. Return supabaseResponse immediately if next-intl initiated a redirect
  // to prevent infinite redirect loops.
  const isIntlRedirect = 
    [301, 302, 307, 308].includes(supabaseResponse.status) || 
    supabaseResponse.headers.has('location');

  if (isIntlRedirect) {
    return supabaseResponse;
  }

  // 4. Extract current locale and normalize pathname by stripping locale prefix
  const pathname = request.nextUrl.pathname;

  const matchedLocale = routing.locales.find(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)
  );

  const currentLocale = matchedLocale || routing.defaultLocale;

  const pathWithoutLocale = matchedLocale
    ? pathname.replace(new RegExp(`^/${matchedLocale}`), '') || '/'
    : pathname;

  // 5. Identify Protected and Auth routes
  const isProtectedRoute = 
    pathWithoutLocale === '/hub' || 
    pathWithoutLocale.startsWith('/hub/') ||
    pathWithoutLocale === '/f1' ||
    pathWithoutLocale.startsWith('/f1/') ||
    pathWithoutLocale === '/leaderboard' ||
    pathWithoutLocale.startsWith('/leaderboard/') ||
    pathWithoutLocale === '/profile' ||
    pathWithoutLocale.startsWith('/profile/');

  const isAuthRoute = 
    pathWithoutLocale === '/' || 
    pathWithoutLocale === '/login';

  // 6. Enforce Auth Guard rules
  // Case A: Unauthenticated user accessing protected route -> Redirect to /[locale]/login
  if (isProtectedRoute && !user) {
    const loginUrl = new URL(`/${currentLocale}/login`, request.url);
    const redirectResponse = NextResponse.redirect(loginUrl);

    // Copy cookies from supabaseResponse to preserve session tokens
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });

    return redirectResponse;
  }

  // Case B: Authenticated user visiting / or /login -> Redirect to /[locale]/hub
  if (isAuthRoute && user) {
    const hubUrl = new URL(`/${currentLocale}/hub`, request.url);
    const redirectResponse = NextResponse.redirect(hubUrl);

    // Copy cookies from supabaseResponse to preserve session tokens
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });

    return redirectResponse;
  }

  // 7. Pass through for authorized requests
  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};

