import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['es', 'en', 'it', 'pt'],
  defaultLocale: 'es'
});

export const config = {
  matcher: ['/', '/(es|en|it|pt)/:path*']
};
