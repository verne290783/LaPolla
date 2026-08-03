import { test, expect } from '@playwright/test';

test.describe('Tier 4: End-to-End User Journey', () => {
  test('Complete User Journey: Landing -> Redirect -> Locale Switch -> Login -> Hub Navigation', async ({ page }) => {
    // 1. User arrives at root domain
    const initialResponse = await page.goto('/');
    expect(initialResponse?.status()).toBe(200);
    await expect(page).toHaveURL(/\/es/);

    // 2. User switches language to English
    const langSelect = page.locator('select');
    await langSelect.selectOption('en');
    await page.waitForURL(/\/en/);

    // 3. User submits login form in English
    await page.fill('input[type="email"]', 'user@lapolla.com');
    await page.fill('input[type="password"]', 'pass1234');
    await page.click('button[type="submit"]');
    await expect(page.locator('h2')).toHaveText('Confirmation email sent');

    // 4. User navigates to Hub page in English
    const hubResponse = await page.goto('/en/hub');
    expect(hubResponse?.status()).toBe(200);
    await expect(page.locator('h1.glow-text')).toHaveText('La Polla');
    await expect(page.getByRole('heading', { name: 'Formula 1' })).toBeVisible();

    // 5. User navigates to F1 page
    const f1Response = await page.goto('/en/f1');
    expect(f1Response?.status()).toBe(200);
    await expect(page.locator('h1.glow-text')).toHaveText('RACING CLUB');

    // 6. User navigates to Leaderboard page
    const leaderboardResponse = await page.goto('/en/leaderboard');
    expect(leaderboardResponse?.status()).toBe(200);
    await expect(page.locator('table')).toBeVisible();

    // 7. User navigates to Profile page
    const profileResponse = await page.goto('/en/profile');
    expect(profileResponse?.status()).toBe(200);
    await expect(page.locator('h2', { hasText: 'Alex F1' })).toBeVisible();
  });
});
