import { test, expect } from '@playwright/test';

const UNPAID_EMAIL = process.env.FINAL7_UNPAID_EMAIL;
const UNPAID_PASSWORD = process.env.FINAL7_UNPAID_PASSWORD;


// TC-007
test.fixme(
    'Verify checkout page displays correct payment details',
    async ({ page }) => {

        await page.goto('/');

        // Open Login
        await page
            .getByLabel('Main navigation')
            .getByRole('link', { name: 'LOGIN' })
            .click();

        // Login with an unpaid participant account
        await page
            .getByRole('textbox', { name: 'Email' })
            .fill(UNPAID_EMAIL);

        await page
            .getByRole('textbox', { name: 'Password' })
            .fill(UNPAID_PASSWORD);

        await page
            .getByRole('button', { name: 'SIGN IN' })
            .click();

        // Unpaid participant should reach checkout
        await expect(page).toHaveURL(
            /#\/checkout$/,
            { timeout: 15000 }
        );

        // Verify participation fee
        await expect(
            page.getByText('₹499', { exact: true })
        ).toBeVisible();

        // Verify legal acknowledgement control
        const selectAll = page.getByRole('checkbox', {
            name: 'SELECT ALL'
        });

        await expect(selectAll).toBeVisible();

        // Before accepting legal terms,
        // payment should not be available
        await expect(
            page.getByRole('button', {
                name: /ACCEPT ALL TERMS|COMPLETE REQUIRED DISCLOSURES/i
            })
        ).toBeDisabled();

    }
);