import { test, expect } from '@playwright/test';

test.describe('Tier 1: Routing & Redirection', () => {
  test('Root path / returns HTTP 307 redirecting to /es default locale and lands with 200 OK', async ({ page }) => {
    // 1. Explicitly assert HTTP 307 Temporary Redirect status code on root /
    const res = await page.request.get('/', { maxRedirects: 0 });
    expect(res.status()).toBe(307);
    expect(res.headers()['location']).toContain('/es');

    // 2. Follow redirect with page navigation to verify final landing page status
    const response = await page.goto('/');
    await expect(page).toHaveURL(/\/es/);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1.glow-text')).toHaveText('La Polla');
  });

  test('Un-prefixed routes (/login, /hub, /f1, /profile) return HTTP 307 redirecting to /es/* and land with 200 OK', async ({ page }) => {
    const unPrefixedRoutes = ['/login', '/hub', '/f1', '/profile'];

    for (const route of unPrefixedRoutes) {
      // 1. Assert HTTP 307 Temporary Redirect and Location header for un-prefixed route
      const res = await page.request.get(route, { maxRedirects: 0 });
      expect(res.status()).toBe(307);
      expect(res.headers()['location']).toContain(`/es${route}`);

      // 2. Follow redirect to verify final landing page returns 200 OK
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveURL(new RegExp(`/es${route}`));
    }
  });

  test('/es/login returns 200 OK and renders LoginForm', async ({ page }) => {
    const response = await page.goto('/es/login');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1.glow-text')).toHaveText('La Polla');
    await expect(page.locator('button[type="submit"]')).toHaveText('Iniciar Sesión');
  });

  test('All Spanish locale pages (/es/hub, /es/f1, /es/leaderboard, /es/profile) return 200 OK', async ({ page }) => {
    const routes = ['/es/hub', '/es/f1', '/es/leaderboard', '/es/profile'];
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
    }
  });

  test('Non-Spanish locales (/en, /it, /pt) return 200 OK and render correctly', async ({ page }) => {
    const locales = ['en', 'it', 'pt'];
    for (const locale of locales) {
      const response = await page.goto(`/${locale}`);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveURL(new RegExp(`/${locale}`));
    }
  });
});

