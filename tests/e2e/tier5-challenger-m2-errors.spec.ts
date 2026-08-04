import { test, expect } from '@playwright/test';

test.describe('Milestone 2 Challenger: Login Form Error Handling & Edge Cases', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/es');
  });

  test('1. Empty Email & Password: HTML5 validation prevents submission', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    // Confirm inputs have 'required' attribute
    await expect(emailInput).toHaveAttribute('required', '');
    await expect(passwordInput).toHaveAttribute('required', '');

    // Click submit without filling anything
    await submitBtn.click();

    // Verify form was not submitted (no error banner, no loading state)
    await expect(page.locator('[role="alert"]')).not.toBeVisible();
    await expect(submitBtn).not.toHaveText(/Iniciando sesión.../);
  });

  test('2. Invalid Email Format: HTML5 validation & Supabase fallback message', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    // Fill invalid email format
    await emailInput.fill('invalid-email-address');
    await passwordInput.fill('password123');

    // Attempt submission
    await submitBtn.click();

    // Browser HTML5 validation should flag input as invalid
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.checkValidity());
    expect(isInvalid).toBe(true);

    // Bypass HTML5 validation programmatically to test component error handling
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) {
        form.noValidate = true;
      }
    });

    await submitBtn.click();

    // Error banner should appear with Spanish message for invalid email
    const errorBanner = page.locator('[role="alert"]');
    await expect(errorBanner).toBeVisible({ timeout: 5000 });
    await expect(errorBanner).toContainText('Por favor ingresa un correo electrónico válido.');
  });

  test('3. Short Password (< 6 chars) in Registration Mode', async ({ page }) => {
    // Toggle to registration mode
    const toggleBtn = page.getByRole('button', { name: /¿No tienes cuenta\? Registrarse/i });
    await toggleBtn.click();

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    await expect(submitBtn).toHaveText('Registrarse');

    // Fill valid email and short password (5 characters)
    const testEmail = `test_shortpass_${Date.now()}@example.com`;
    await emailInput.fill(testEmail);
    await passwordInput.fill('12345');

    await submitBtn.click();

    // Error banner should appear with helpful Spanish message for short password
    const errorBanner = page.locator('[role="alert"]');
    await expect(errorBanner).toBeVisible({ timeout: 8000 });
    await expect(errorBanner).toContainText('La contraseña debe tener al menos 6 caracteres.');
  });

  test('4. Supabase Auth Failure: Invalid Login Credentials', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    // Fill non-existent user credentials
    await emailInput.fill('nonexistent_user_9999@example.com');
    await passwordInput.fill('WrongPassword123!');

    await submitBtn.click();

    // Verify loading state is shown
    await expect(submitBtn).toHaveText(/Iniciando sesión.../);

    // Error banner should appear with Spanish message for invalid credentials
    const errorBanner = page.locator('[role="alert"]');
    await expect(errorBanner).toBeVisible({ timeout: 8000 });
    await expect(errorBanner).toContainText('Correo o contraseña incorrectos. Por favor verifica tus datos.');
    
    // Icon and role check
    await expect(errorBanner).toContainText('⚠️');
    await expect(errorBanner).toHaveAttribute('role', 'alert');
  });

  test('5. Mode Toggle resets error and message states', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    // Trigger error in login mode
    await emailInput.fill('nonexistent_user_9999@example.com');
    await passwordInput.fill('WrongPassword123!');
    await submitBtn.click();

    const errorBanner = page.locator('[role="alert"]');
    await expect(errorBanner).toBeVisible({ timeout: 8000 });

    // Toggle mode to Registration
    const toggleBtn = page.getByRole('button', { name: /¿No tienes cuenta\? Registrarse/i });
    await toggleBtn.click();

    // Error banner should be cleared
    await expect(errorBanner).not.toBeVisible();
  });
});
