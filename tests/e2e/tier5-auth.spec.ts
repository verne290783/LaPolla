import { test, expect } from '@playwright/test';

test.describe('Tier 5 Auth E2E Suite: Authentication UI, Mode Toggle, Error Banners, OAuth & Route Protection', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/es/login');
  });

  /**
   * Requirement 2a: Login UI rendering
   * Verify email/password inputs, submit button, Google button, logo, glassmorphism container, and PROMPT_MAESTRO styling.
   */
  test('2a. Login UI rendering: inputs, submit button, Google button & PROMPT_MAESTRO styling', async ({ page }) => {
    // Email input check
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('required', '');
    await expect(emailInput).toHaveClass(/input-field/);
    await expect(emailInput).toHaveAttribute('aria-label', /Correo Electrónico|Email/i);

    // Password input check
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('required', '');
    await expect(passwordInput).toHaveClass(/input-field/);
    await expect(passwordInput).toHaveAttribute('aria-label', /Contraseña|Password/i);

    // Submit button check
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toHaveText(/Iniciar sesión|Iniciar Sesión/i);
    await expect(submitBtn).toHaveClass(/btn-primary/);

    // Google OAuth button check
    const googleBtn = page.locator('button:has-text("Continuar con Google"), button:has-text("Google")');
    await expect(googleBtn).toBeVisible();
    await expect(googleBtn).toHaveAttribute('type', 'button');
    await expect(googleBtn).toHaveClass(/btn-primary/);
    const googleSvg = googleBtn.locator('svg');
    await expect(googleSvg).toBeVisible();

    // PROMPT_MAESTRO Glassmorphism UI styling structure check
    const glassCard = page.locator('.glass-panel');
    await expect(glassCard).toBeVisible();
    const logoImage = page.locator('img[alt="La Polla Elite Prediction Club"]');
    await expect(logoImage).toBeVisible();
  });

  /**
   * Requirement 2b: Mode toggle between Login and Registration
   * Verify toggling between Login mode and Registration mode.
   */
  test('2b. Mode toggle between Login and Registration', async ({ page }) => {
    const submitBtn = page.locator('button[type="submit"]');
    const toggleBtn = page.getByRole('button', { name: /¿No tienes cuenta\? Registrarse|¿Ya tienes cuenta\? Iniciar sesión/i });

    // Initially in Login mode
    await expect(submitBtn).toHaveText(/Iniciar sesión|Iniciar Sesión/i);
    await expect(toggleBtn).toHaveText(/¿No tienes cuenta\? Registrarse/i);

    // Click toggle button -> Switch to Registration mode
    await toggleBtn.click();
    await expect(submitBtn).toHaveText('Registrarse');
    await expect(toggleBtn).toHaveText(/¿Ya tienes cuenta\? Iniciar sesión/i);

    // Click toggle button again -> Switch back to Login mode
    await toggleBtn.click();
    await expect(submitBtn).toHaveText(/Iniciar sesión|Iniciar Sesión/i);
    await expect(toggleBtn).toHaveText(/¿No tienes cuenta\? Registrarse/i);
  });

  /**
   * Requirement 2c: Error alert banner display on invalid inputs or failed auth
   * Verify error alert banners for invalid email, short password, and failed authentication credentials.
   */
  test('2c1. Error alert banner display on invalid email input', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    await emailInput.fill('invalid-email-format');
    await passwordInput.fill('password123');

    // Bypass HTML5 validation programmatically to test component error handling banner
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) form.noValidate = true;
    });

    await submitBtn.click();

    const errorBanner = page.locator('[role="alert"]');
    await expect(errorBanner).toBeVisible({ timeout: 5000 });
    await expect(errorBanner).toContainText('Por favor ingresa un correo electrónico válido.');
    await expect(errorBanner).toContainText('⚠️');
  });

  test('2c2. Error alert banner display on short password in registration mode', async ({ page }) => {
    // Switch to Registration mode
    const toggleBtn = page.getByRole('button', { name: /¿No tienes cuenta\? Registrarse/i });
    await toggleBtn.click();

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    await emailInput.fill('test_user_shortpass@example.com');
    await passwordInput.fill('12345'); // 5 chars < 6

    await submitBtn.click();

    const errorBanner = page.locator('[role="alert"]');
    await expect(errorBanner).toBeVisible({ timeout: 8000 });
    await expect(errorBanner).toContainText('La contraseña debe tener al menos 6 caracteres.');
    await expect(errorBanner).toContainText('⚠️');
  });

  test('2c3. Error alert banner display on failed auth (invalid credentials)', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    await emailInput.fill('nonexistent_user_99999@example.com');
    await passwordInput.fill('WrongPassword999!');

    await submitBtn.click();

    // Verify loading state is displayed
    await expect(submitBtn).toHaveText(/Iniciando sesión.../);

    // Verify error banner appears with Spanish message and icon
    const errorBanner = page.locator('[role="alert"]');
    await expect(errorBanner).toBeVisible({ timeout: 8000 });
    await expect(errorBanner).toContainText('Correo o contraseña incorrectos. Por favor verifica tus datos.');
    await expect(errorBanner).toContainText('⚠️');
  });

  /**
   * Requirement 2d: Google OAuth button click handling and redirect URL generation
   * Verify clicking Google OAuth button triggers loading state and calls Supabase authorize URL with provider=google.
   */
  test('2d. Google OAuth button click handling and redirect URL generation', async ({ page }) => {
    const googleBtn = page.locator('button:has-text("Continuar con Google"), button:has-text("Google")');
    const submitBtn = page.locator('button[type="submit"]');

    let interceptedUrl = '';

    // Intercept Supabase authorize request to verify URL generation and query parameters
    await page.route('**/auth/v1/authorize**', async (route) => {
      interceptedUrl = route.request().url();
      await route.fulfill({
        status: 302,
        headers: {
          location: 'http://localhost:3005/es/auth/callback?error=provider_disabled',
        },
      });
    });

    await googleBtn.click();

    // Verify Google button enters loading state and disables inputs
    await expect(googleBtn).toBeDisabled();
    await expect(googleBtn).toContainText(/Iniciando con Google.../);
    await expect(submitBtn).toBeDisabled();

    // Verify generated OAuth request URL contains provider=google and redirect_to
    expect(interceptedUrl).toContain('provider=google');
    expect(interceptedUrl).toContain('redirect_to');
  });

  /**
   * Requirement 2e: Unauthenticated access to /hub (redirects to login/homepage)
   * Verify accessing protected route /hub without session redirects back to /login.
   */
  test('2e1. Unauthenticated access to /es/hub redirects to login page', async ({ page }) => {
    const response = await page.goto('/es/hub');
    
    // Page should be redirected to /es/login
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/es\/login/);

    // Confirm login form is displayed
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('2e2. Unauthenticated access to root /hub redirects to default locale login', async ({ page }) => {
    const response = await page.goto('/hub');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/es\/login/);
  });

  /**
   * Requirement 2f: Authenticated access redirection to /hub
   * Verify successful login authentication flow redirects user to /hub.
   */
  test('2f. Successful authentication flow redirects user to /hub', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    // Intercept Supabase sign-in API request to simulate successful authentication
    await page.route('**/auth/v1/token?grant_type=password', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-access-token-12345',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock-refresh-token-12345',
          user: {
            id: 'mock-user-id-12345',
            email: 'auth_user@example.com',
            aud: 'authenticated',
            role: 'authenticated',
            user_metadata: { full_name: 'Usuario Autenticado' },
          },
        }),
      });
    });

    await emailInput.fill('auth_user@example.com');
    await passwordInput.fill('ValidPassword123!');

    await submitBtn.click();

    // Verify success banner/message appears
    const statusBanner = page.locator('[role="status"]');
    await expect(statusBanner).toBeVisible({ timeout: 5000 });
    await expect(statusBanner).toContainText('¡Inicio de sesión exitoso! Redirigiendo...');

    // Verify redirection to /hub occurs
    await expect(page).toHaveURL(/\/es\/hub/, { timeout: 8000 });
  });

});
