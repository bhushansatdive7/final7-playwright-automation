import { test, expect } from '@playwright/test';

test('Verify unauthenticated user is redirected from dashboard to login', async ({ page }) => {

    await page.goto('/#/dashboard');

    // Logged-out user should be redirected to login
    await expect(page).toHaveURL(
        /#\/login$/,
        { timeout: 10000 }
    );

    // Confirm login page loaded correctly
    await expect(
        page.getByRole('button', { name: 'SIGN IN' })
    ).toBeVisible();

    // Protected dashboard content must not be exposed
    await expect(
        page.getByText(/PARTICIPANT DASHBOARD/i)
    ).not.toBeVisible();

});