    import { test, expect } from '@playwright/test';

test('Verify Final7 landing page loads successfully', async ({ page }) => {

  const response = await page.goto('/');

  expect(response.ok()).toBeTruthy();

  await expect(page).toHaveURL('https://thefinal7.online/');

  await expect(page).toHaveTitle(/FINAL 7/i);

  await expect(page.locator('body')).toBeVisible();

});