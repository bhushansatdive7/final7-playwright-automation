import { test, expect } from '@playwright/test';

test('Verify unauthenticated user cannot access dashboard directly', async ({ page }) => {

    await page.goto('/#/dashboard');

    // Dashboard information must never be exposed
    await expect(
        page.getByText(/PAYMENT.*VERIFIED/i)
    ).not.toBeVisible();

    await expect(
        page.getByText(/PARTICIPANT DASHBOARD/i)
    ).not.toBeVisible();

});