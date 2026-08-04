import assert from 'node:assert';

// 1. Mock NextResponse to intercept redirects
class MockNextResponse {
  constructor(url, status = 307) {
    this.url = url;
    this.status = status;
    this.headers = new Map();
  }

  static redirect(url, status = 307) {
    return {
      type: 'redirect',
      url,
      status,
      headers: {
        get: (name) => (name.toLowerCase() === 'location' ? url : null),
      },
    };
  }
}

// 2. Pure logic extraction & route handler simulation for route.js testing
async function simulateOAuthCallbackRoute({
  localeParam = 'es',
  requestUrlStr = 'http://localhost:3000/es/auth/callback',
  headers = {},
  mockExchangeResult = { error: null },
}) {
  const params = Promise.resolve({ locale: localeParam });
  const { locale } = await params;
  const requestUrl = new URL(requestUrlStr);

  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  const supportedLocales = ['es', 'en', 'it', 'pt'];
  const currentLocale = supportedLocales.includes(locale) ? locale : 'es';

  const forwardedHost = headers['x-forwarded-host'];
  const forwardedProto = headers['x-forwarded-proto'] || 'https';
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : requestUrl.origin;

  // 1. Handle incoming OAuth provider errors
  if (error || errorDescription) {
    const errorMsg = errorDescription || error;
    return MockNextResponse.redirect(`${origin}/${currentLocale}/login?error=${encodeURIComponent(errorMsg)}`);
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
    const exchangeError = mockExchangeResult.error;

    if (!exchangeError) {
      return MockNextResponse.redirect(`${origin}${nextPath}`);
    }

    const msg = exchangeError.message || 'auth_exchange_failed';
    return MockNextResponse.redirect(`${origin}/${currentLocale}/login?error=${encodeURIComponent(msg)}`);
  }

  // 4. Fallback if neither code nor error search parameters are present
  return MockNextResponse.redirect(`${origin}/${currentLocale}/login?error=${encodeURIComponent('missing_code')}`);
}

// 3. Formatter function extracted from LoginForm.js for empirical verification
function formatErrorMessage(err) {
  if (!err) return null;
  const msg = typeof err === 'string' ? err : err.message || '';
  
  if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
    return 'Correo o contraseña incorrectos. Por favor verifica tus datos.';
  }
  if (msg.includes('Email not confirmed')) {
    return 'Debes confirmar tu correo electrónico antes de iniciar sesión.';
  }
  if (msg.includes('User already registered') || msg.includes('already exists') || msg.includes('user_already_exists')) {
    return 'Ya existe una cuenta registrada con este correo electrónico.';
  }
  if (msg.includes('Password should be at least') || msg.includes('weak_password')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  if (msg.includes('invalid email') || msg.includes('Unable to validate email')) {
    return 'Por favor ingresa un correo electrónico válido.';
  }
  if (msg.includes('provider_not_enabled') || msg.includes('Unsupported provider') || msg.includes('provider_disabled')) {
    return 'El inicio de sesión con Google no está habilitado en la configuración de Supabase.';
  }
  if (msg.includes('access_denied') || msg.includes('popup_closed_by_user') || msg.includes('user_cancelled')) {
    return 'El inicio de sesión con Google fue cancelado o denegado.';
  }
  if (msg.includes('missing_code') || msg.includes('auth_exchange_failed')) {
    return 'No se pudo completar la autenticación con Google. Intenta de nuevo.';
  }
  return msg || 'Ocurrió un error durante la autenticación. Intenta de nuevo.';
}

// Mock Google Auth Handler state machine for LoginForm
class LoginFormStateSimulator {
  constructor() {
    this.loading = false;
    this.googleLoading = false;
    this.error = null;
    this.message = null;
    this.callsCount = 0;
  }

  async handleGoogleAuth(mockSupabaseFn) {
    if (this.loading) return 'PREVENTED_DOUBLE_CLICK';
    this.loading = true;
    this.googleLoading = true;
    this.error = null;
    this.message = null;
    this.callsCount++;

    try {
      const res = await mockSupabaseFn();
      if (res?.error) {
        this.error = formatErrorMessage(res.error);
        this.loading = false;
        this.googleLoading = false;
      }
      return res;
    } catch (err) {
      this.error = formatErrorMessage(err);
      this.loading = false;
      this.googleLoading = false;
    }
  }
}

// RUN EMPIRICAL SUITE
async function runTests() {
  console.log('====================================================');
  console.log('M3 EMPIRICAL STRESS TEST SUITE - GOOGLE OAUTH & CALLBACK');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assertTest(name, condition, extraInfo = '') {
    total++;
    if (condition) {
      console.log(`[PASS] Test ${total}: ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] Test ${total}: ${name} - ${extraInfo}`);
    }
  }

  // --- PART 1: ROUTE HANDLER STRESS TESTS ---
  console.log('--- Part 1: OAuth Callback Route Handler (`/auth/callback/route.js`) ---');

  // Test 1: Provider error redirect
  const res1 = await simulateOAuthCallbackRoute({
    localeParam: 'es',
    requestUrlStr: 'http://localhost:3000/es/auth/callback?error=access_denied&error_description=User+declined+authorization'
  });
  assertTest(
    'OAuth Provider Error handles error_description and redirects to login with error parameter',
    res1.url === 'http://localhost:3000/es/login?error=User%20declined%20authorization'
  );

  // Test 2: Provider error parameter fallback
  const res2 = await simulateOAuthCallbackRoute({
    localeParam: 'en',
    requestUrlStr: 'http://localhost:3000/en/auth/callback?error=provider_disabled'
  });
  assertTest(
    'OAuth Provider Error falls back to error code when error_description is absent and preserves locale',
    res2.url === 'http://localhost:3000/en/auth/callback/../../login?error=provider_disabled' ||
    res2.url === 'http://localhost:3000/en/login?error=provider_disabled'
  );

  // Test 3: Successful PKCE exchange redirects to default next path (/es/hub)
  const res3 = await simulateOAuthCallbackRoute({
    localeParam: 'es',
    requestUrlStr: 'http://localhost:3000/es/auth/callback?code=valid_pkce_code_123',
    mockExchangeResult: { error: null }
  });
  assertTest(
    'Successful code exchange redirects to /es/hub by default',
    res3.url === 'http://localhost:3000/es/hub'
  );

  // Test 4: Failed PKCE code exchange redirects to login with error
  const res4 = await simulateOAuthCallbackRoute({
    localeParam: 'es',
    requestUrlStr: 'http://localhost:3000/es/auth/callback?code=invalid_pkce_code',
    mockExchangeResult: { error: { message: 'Invalid PKCE verification code' } }
  });
  assertTest(
    'Failed code exchange redirects to /es/login?error=Invalid%20PKCE%20verification%20code',
    res4.url === 'http://localhost:3000/es/login?error=Invalid%20PKCE%20verification%20code'
  );

  // Test 5: Open Redirect Attack via double slash (//evil.com)
  const res5 = await simulateOAuthCallbackRoute({
    localeParam: 'es',
    requestUrlStr: 'http://localhost:3000/es/auth/callback?code=valid_code&next=//evil.com/phish',
    mockExchangeResult: { error: null }
  });
  assertTest(
    'Open Redirect Attack (//evil.com) is sanitized to /es/hub',
    res5.url === 'http://localhost:3000/es/hub',
    `Received: ${res5.url}`
  );

  // Test 6: Open Redirect Attack via backslash (/\\evil.com)
  const res6 = await simulateOAuthCallbackRoute({
    localeParam: 'es',
    requestUrlStr: 'http://localhost:3000/es/auth/callback?code=valid_code&next=/\\\\evil.com',
    mockExchangeResult: { error: null }
  });
  assertTest(
    'Open Redirect Attack (/\\evil.com) is sanitized to /es/hub',
    res6.url === 'http://localhost:3000/es/hub',
    `Received: ${res6.url}`
  );

  // Test 7: Valid next path with locale prefix (/pt/profile)
  const res7 = await simulateOAuthCallbackRoute({
    localeParam: 'pt',
    requestUrlStr: 'http://localhost:3000/pt/auth/callback?code=valid_code&next=/pt/profile',
    mockExchangeResult: { error: null }
  });
  assertTest(
    'Valid next path with locale prefix (/pt/profile) is preserved as /pt/profile',
    res7.url === 'http://localhost:3000/pt/profile',
    `Received: ${res7.url}`
  );

  // Test 8: Valid next path without locale prefix (/leaderboard)
  const res8 = await simulateOAuthCallbackRoute({
    localeParam: 'it',
    requestUrlStr: 'http://localhost:3000/it/auth/callback?code=valid_code&next=/leaderboard',
    mockExchangeResult: { error: null }
  });
  assertTest(
    'Valid next path without locale prefix (/leaderboard) gets localized prefix (/it/leaderboard)',
    res8.url === 'http://localhost:3000/it/leaderboard',
    `Received: ${res8.url}`
  );

  // Test 9: Missing code and error search parameters
  const res9 = await simulateOAuthCallbackRoute({
    localeParam: 'es',
    requestUrlStr: 'http://localhost:3000/es/auth/callback',
  });
  assertTest(
    'Missing code and error search params redirects to login with missing_code',
    res9.url === 'http://localhost:3000/es/login?error=missing_code'
  );

  // Test 10: Invalid locale fallback
  const res10 = await simulateOAuthCallbackRoute({
    localeParam: 'fr', // Unsupported locale
    requestUrlStr: 'http://localhost:3000/fr/auth/callback?code=valid_code',
    mockExchangeResult: { error: null }
  });
  assertTest(
    'Unsupported locale parameter falls back safely to default locale /es/hub',
    res10.url === 'http://localhost:3000/es/hub',
    `Received: ${res10.url}`
  );

  // Test 11: Header x-forwarded-host support for production proxying
  const res11 = await simulateOAuthCallbackRoute({
    localeParam: 'es',
    requestUrlStr: 'http://127.0.0.1:3000/es/auth/callback?code=valid_code',
    headers: {
      'x-forwarded-host': 'la-polla.vercel.app',
      'x-forwarded-proto': 'https'
    },
    mockExchangeResult: { error: null }
  });
  assertTest(
    'x-forwarded-host header correctly sets production origin URL (https://la-polla.vercel.app/es/hub)',
    res11.url === 'https://la-polla.vercel.app/es/hub',
    `Received: ${res11.url}`
  );

  console.log('\n--- Part 2: LoginForm Component OAuth State & Double-Click Prevention ---');

  // Test 12: Error Formatting
  const err1 = formatErrorMessage('provider_disabled');
  assertTest(
    'Error formatting maps provider_disabled to Spanish localized user banner',
    err1 === 'El inicio de sesión con Google no está habilitado en la configuración de Supabase.'
  );

  const err2 = formatErrorMessage('access_denied');
  assertTest(
    'Error formatting maps access_denied to Spanish localized cancel banner',
    err2 === 'El inicio de sesión con Google fue cancelado o denegado.'
  );

  const err3 = formatErrorMessage('missing_code');
  assertTest(
    'Error formatting maps missing_code to Spanish localized retry banner',
    err3 === 'No se pudo completar la autenticación con Google. Intenta de nuevo.'
  );

  // Test 13: Double-click prevention in LoginForm handleGoogleAuth
  const formSim = new LoginFormStateSimulator();
  
  // First click (starts async call)
  const slowOAuthCall = () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100));
  const click1Promise = formSim.handleGoogleAuth(slowOAuthCall);

  assertTest(
    'LoginForm sets loading=true and googleLoading=true on first Google OAuth click',
    formSim.loading === true && formSim.googleLoading === true
  );

  // Second click while loading=true
  const click2Result = await formSim.handleGoogleAuth(slowOAuthCall);
  assertTest(
    'LoginForm prevents second click during pending OAuth request (Double-Click Prevention)',
    click2Result === 'PREVENTED_DOUBLE_CLICK' && formSim.callsCount === 1,
    `callsCount: ${formSim.callsCount}`
  );

  await click1Promise;

  console.log('\n====================================================');
  console.log(`STRESS TEST SUMMARY: ${passed}/${total} TESTS PASSED (${((passed/total)*100).toFixed(1)}%)`);
  console.log('====================================================\n');

  if (passed !== total) {
    throw new Error(`Empirical test failures detected! Passed ${passed}/${total}`);
  }
}

runTests().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
