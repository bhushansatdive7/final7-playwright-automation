import { test, expect } from '@playwright/test';

test('Verify ENTER link navigates user correctly', async ({ page }) => {

    await page.goto('/');

    const enterLink = page.getByRole('link', { name: 'ENTER ₹' });

    await expect(enterLink).toBeVisible();

    await enterLink.click();
    await expect(page).toHaveURL('https://thefinal7.online/#/register');

});