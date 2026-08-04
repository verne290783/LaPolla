// Test script for Next.js proxy matcher regex
// Matcher string from src/proxy.js: '/((?!api|_next|_vercel|.*\\..*).*)'

const pathMatcherRegex = /^\/((?!api|_next|_vercel|.*\..*).*)$/;

const testCases = [
  { path: '/', expected: true, desc: 'Root route' },
  { path: '/es', expected: true, desc: 'Spanish locale root' },
  { path: '/en', expected: true, desc: 'English locale root' },
  { path: '/es/login', expected: true, desc: 'Localized page (login)' },
  { path: '/es/hub', expected: true, desc: 'Localized page (hub)' },
  { path: '/es/leaderboard', expected: true, desc: 'Localized page (leaderboard)' },
  { path: '/es/profile', expected: true, desc: 'Localized page (profile)' },
  { path: '/es/f1', expected: true, desc: 'Localized page (f1)' },
  { path: '/api/auth', expected: false, desc: 'API route' },
  { path: '/api/health', expected: false, desc: 'API health route' },
  { path: '/_next/static/chunks/app/page.js', expected: false, desc: '_next static JS chunk' },
  { path: '/_next/static/css/app.css', expected: false, desc: '_next static CSS chunk' },
  { path: '/_vercel/insights/script.js', expected: false, desc: '_vercel static asset' },
  { path: '/favicon.ico', expected: false, desc: 'Favicon file' },
  { path: '/globe.svg', expected: false, desc: 'SVG asset' },
  { path: '/next.svg', expected: false, desc: 'SVG asset' },
  { path: '/file.png', expected: false, desc: 'PNG asset' },
  { path: '/sitemap.xml', expected: false, desc: 'XML sitemap' },
  { path: '/robots.txt', expected: false, desc: 'Robots txt file' },
  { path: '/unhandled-route', expected: true, desc: 'Unhandled route without locale' },
  { path: '/es/unhandled-route', expected: true, desc: 'Unhandled route with locale' },
  // Edge cases
  { path: '/api', expected: false, desc: 'Bare /api path' },
  { path: '/api_custom', expected: true, desc: 'Route starting with api_ (is it excluded?)' },
  { path: '/_next', expected: false, desc: 'Bare /_next path' },
  { path: '/_next_custom', expected: true, desc: 'Route starting with _next_ (is it excluded?)' },
  { path: '/es/user.name', expected: false, desc: 'Route with dot in path segment' },
  { path: '/es/post/1.0', expected: false, desc: 'Route with decimal/version number' },
];

console.log('=== Empirical Matcher Regex Verification ===\n');
let passed = 0;
let failed = 0;

for (const tc of testCases) {
  const isMatched = pathMatcherRegex.test(tc.path);
  const status = isMatched === tc.expected ? 'PASS' : 'FAIL';
  if (status === 'FAIL') failed++;
  else passed++;
  console.log(`[${status}] ${tc.desc.padEnd(45)} Path: "${tc.path}" => Matched: ${isMatched} (Expected: ${tc.expected})`);
}

console.log(`\nSummary: ${passed} PASSED, ${failed} FAILED out of ${testCases.length} tests.`);
