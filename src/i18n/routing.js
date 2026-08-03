import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['es', 'en', 'it', 'pt'],
  defaultLocale: 'es'
});
