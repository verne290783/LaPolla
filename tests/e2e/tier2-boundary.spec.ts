import { test, expect } from '@playwright/test';

test.describe('Tier 2: Boundary & Form Validation', () => {
  test('Unknown routes return 404 status code or render 404 page', async ({ page }) => {
    const response = await page.goto('/non-existent-route-xyz');
    expect(response?.status()).toBe(404);
  });

  test('Unknown locale route returns 404 status code', async ({ page }) => {
    const response = await page.goto('/es/unknown-nested-page-xyz');
    expect(response?.status()).toBe(404);
  });

  test('LoginForm requires email and password before submit', async ({ page }) => {
    await page.goto('/es/login');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    // Check required attribute
    await expect(emailInput).toHaveAttribute('required', '');
    await expect(passwordInput).toHaveAttribute('required', '');

    // Submit empty form should maintain page (no success state)
    await submitBtn.click();
    await expect(page.getByText('Correo de confirmación enviado')).not.toBeVisible();
  });

  test('LoginForm submission displays success state', async ({ page }) => {
    await page.goto('/es/login');
    await page.fill('input[type="email"]', 'testuser@example.com');
    await page.fill('input[type="password"]', 'secretpassword123');
    await page.click('button[type="submit"]');

    // Verify success state rendered
    await expect(page.locator('h2')).toHaveText('Correo de confirmación enviado');
    await expect(page.getByText('Revisa tu bandeja de entrada para continuar.')).toBeVisible();
  });
});
