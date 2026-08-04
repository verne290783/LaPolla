import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request, { params }) {
  const { locale } = await params;
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  const supportedLocales = ['es', 'en', 'it', 'pt'];
  const currentLocale = supportedLocales.includes(locale) ? locale : 'es';

  // Construct origin safely for local dev and Vercel production
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const origin = forwardedHost 
    ? `${forwardedProto}://${forwardedHost}` 
    : requestUrl.origin;

  // 1. Handle incoming OAuth provider errors
  if (error || errorDescription) {
    console.error('OAuth Callback Provider Error:', error, errorDescription);
    const errorMsg = errorDescription || error;
    return NextResponse.redirect(`${origin}/${currentLocale}/login?error=${encodeURIComponent(errorMsg)}`);
  }

  // 2. Sanitize 'next' path to prevent open redirect vulnerabilities
  let nextPath = `/${currentLocale}/hub`;
  if (next && typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\')) {
    const hasLocalePrefix = supportedLocales.some(loc => 
      next === `/${loc}` || next.startsWith(`/${loc}/`)
    );
    if (hasLocalePrefix) {
      nextPath = next;
    } else {
      const cleanNext = next.startsWith('/') ? next : `/${next}`;
      nextPath = `/${currentLocale}${cleanNext}`;
    }
  }

  // 3. Exchange OAuth PKCE code for Supabase session
  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${nextPath}`);
    }

    console.error('OAuth Session Exchange Error:', exchangeError.message);
    const msg = exchangeError.message || 'auth_exchange_failed';
    return NextResponse.redirect(`${origin}/${currentLocale}/login?error=${encodeURIComponent(msg)}`);
  }

  // 4. Fallback if neither code nor error search parameters are present
  return NextResponse.redirect(`${origin}/${currentLocale}/login?error=${encodeURIComponent('missing_code')}`);
}
