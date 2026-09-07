import { test, expect } from '@playwright/test';

test('Verify REGISTER NOW navigates user to registration page', async ({ page }) => {

    await page.goto('/');

    const registerLink = page
        .getByLabel('Main navigation')
        .getByRole('link', {
            name: 'REGISTER NOW',
            exact: true
        });

    await expect(registerLink).toBeVisible();

    await registerLink.click();

    await expect(page).toHaveURL(
        /#\/register$/
    );

});