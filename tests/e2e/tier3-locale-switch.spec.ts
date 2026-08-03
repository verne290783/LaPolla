import { test, expect } from '@playwright/test';

test.describe('Tier 3: Client-side Locale Switching', () => {
  test('Switching language from Spanish (es) to English (en) updates URL and UI text', async ({ page }) => {
    await page.goto('/es/login');
    
    // Select element
    const langSelect = page.locator('select');
    await expect(langSelect).toHaveValue('es');
    await expect(page.locator('button[type="submit"]')).toHaveText('Iniciar Sesión');

    // Change to English
    await langSelect.selectOption('en');

    // URL should change to /en or /en/login
    await page.waitForURL(/\/en/);
    await expect(langSelect).toHaveValue('en');
    await expect(page.locator('button[type="submit"]')).toHaveText('Sign In');
  });

  test('Switching language between Italian (it) and Portuguese (pt) updates URL and renders localized DOM text', async ({ page }) => {
    await page.goto('/es/login');
    const langSelect = page.locator('select');

    // Switch to Italian
    await langSelect.selectOption('it');
    await page.waitForURL(/\/it/);
    await expect(langSelect).toHaveValue('it');
    await expect(page.locator('button[type="submit"]')).toHaveText('Accedi');
    await expect(page.locator('h1.glow-text')).toHaveText('La Polla');

    // Switch to Portuguese
    await langSelect.selectOption('pt');
    await page.waitForURL(/\/pt/);
    await expect(langSelect).toHaveValue('pt');
    await expect(page.locator('button[type="submit"]')).toHaveText('Entrar');
    await expect(page.locator('h1.glow-text')).toHaveText('La Polla');
  });
});

