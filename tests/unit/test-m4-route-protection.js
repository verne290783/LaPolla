import assert from 'node:assert';
import { routing } from '../../src/i18n/routing.js';

console.log('Testing routing configuration and proxy logic simulation...');

// Test 1: Locales and Default Locale
assert.deepStrictEqual(routing.locales, ['es', 'en', 'it', 'pt']);
assert.strictEqual(routing.defaultLocale, 'es');

// Test 2: Normalize pathname logic from proxy.js
function getPathWithoutLocale(pathname) {
  const matchedLocale = routing.locales.find(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)
  );
  const currentLocale = matchedLocale || routing.defaultLocale;
  const pathWithoutLocale = matchedLocale
    ? pathname.replace(new RegExp(`^/${matchedLocale}`), '') || '/'
    : pathname;
  return { currentLocale, pathWithoutLocale };
}

// Test cases for route matching
const testCases = [
  { pathname: '/', expectedLocale: 'es', expectedPath: '/' },
  { pathname: '/es', expectedLocale: 'es', expectedPath: '/' },
  { pathname: '/es/', expectedLocale: 'es', expectedPath: '/' },
  { pathname: '/en', expectedLocale: 'en', expectedPath: '/' },
  { pathname: '/it/hub', expectedLocale: 'it', expectedPath: '/hub' },
  { pathname: '/pt/login', expectedLocale: 'pt', expectedPath: '/login' },
  { pathname: '/es/f1', expectedLocale: 'es', expectedPath: '/f1' },
  { pathname: '/es/leaderboard/sub', expectedLocale: 'es', expectedPath: '/leaderboard/sub' },
  { pathname: '/es/profile', expectedLocale: 'es', expectedPath: '/profile' }
];

testCases.forEach(({ pathname, expectedLocale, expectedPath }) => {
  const res = getPathWithoutLocale(pathname);
  assert.strictEqual(res.currentLocale, expectedLocale, `Failed locale for ${pathname}`);
  assert.strictEqual(res.pathWithoutLocale, expectedPath, `Failed path for ${pathname}`);
});

console.log('All path normalization unit tests passed successfully!');
