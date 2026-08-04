import { test, expect } from '@playwright/test';

test.describe('Milestone 3: Google OAuth Integration & Callback Route Handler', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/es/login');
  });

  test('1. Google OAuth Button UI & Attributes', async ({ page }) => {
    const googleBtn = page.locator('button:has-text("Continuar con Google"), button:has-text("Google")');
    await expect(googleBtn).toBeVisible();
    await expect(googleBtn).toHaveAttribute('type', 'button');
    await expect(googleBtn).not.toBeDisabled();

    // Verify SVG icon inside button
    const svgIcon = googleBtn.locator('svg');
    await expect(svgIcon).toBeVisible();
  });

  test('2. URL Error Search Parameter rendering (provider_disabled)', async ({ page }) => {
    await page.goto('/es/login?error=provider_disabled');

    const errorBanner = page.locator('[role="alert"]');
    await expect(errorBanner).toBeVisible({ timeout: 5000 });
    await expect(errorBanner).toContainText('El inicio de sesión con Google no está habilitado en la configuración de Supabase.');
    await expect(errorBanner).toContainText('⚠️');
  });

  test('3. OAuth Callback Route handles provider error (access_denied)', async ({ page }) => {
    // Navigate directly to OAuth callback route with access_denied error parameter
    await page.goto('/es/auth/callback?error=access_denied&error_description=User+cancelled');

    // Should redirect to /es/login?error=User+cancelled
    await expect(page).toHaveURL(/\/es\/login\?error=/);

    const errorBanner = page.locator('[role="alert"]');
    await expect(errorBanner).toBeVisible({ timeout: 5000 });
    await expect(errorBanner).toContainText('El inicio de sesión con Google fue cancelado o denegado.');
  });

  test('4. OAuth Callback Route handles missing code parameter', async ({ page }) => {
    // Navigate directly to OAuth callback route without code or error
    await page.goto('/es/auth/callback');

    // Should redirect to /es/login?error=missing_code
    await expect(page).toHaveURL(/\/es\/login\?error=missing_code/);

    const errorBanner = page.locator('[role="alert"]');
    await expect(errorBanner).toBeVisible({ timeout: 5000 });
    await expect(errorBanner).toContainText('No se pudo completar la autenticación con Google. Intenta de nuevo.');
  });

  test('5. Open Redirect Prevention in OAuth Callback Handler', async ({ page }) => {
    // Attempt malicious next parameter with double slash
    await page.goto('/es/auth/callback?error=access_denied&next=//evil.com');

    // Should safely redirect back to /es/login
    await expect(page).toHaveURL(/\/es\/login/);
    expect(page.url()).not.toContain('evil.com');
  });

  test('6. Google OAuth Button Loading State & Double Click Prevention', async ({ page }) => {
    const googleBtn = page.locator('button:has-text("Continuar con Google"), button:has-text("Google")');
    const submitBtn = page.locator('button[type="submit"]');

    // Intercept Supabase OAuth request to simulate pending call
    await page.route('**/auth/v1/authorize**', async (route) => {
      // Delay response to inspect loading state
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 302,
        headers: { location: 'http://localhost:3000/es/auth/callback?error=provider_disabled' },
      });
    });

    // Click Google OAuth button
    await googleBtn.click();

    // Verify loading spinner & disabled state immediately after click
    await expect(googleBtn).toBeDisabled();
    await expect(googleBtn).toContainText('Iniciando con Google...');
    await expect(submitBtn).toBeDisabled();

    // Attempt second click (double click) while loading
    await googleBtn.click({ force: true }).catch(() => {});

    // Wait for route handling to complete
    const errorBanner = page.locator('[role="alert"]');
    await expect(errorBanner).toBeVisible({ timeout: 5000 });
  });

});
