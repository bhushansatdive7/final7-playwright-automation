import { test, expect } from '@playwright/test';

const UNPAID_EMAIL = process.env.FINAL7_UNPAID_EMAIL;
const UNPAID_PASSWORD = process.env.FINAL7_UNPAID_PASSWORD;


// TC-008
test.fixme(
    'Verify Razorpay payment gateway opens successfully',
    async ({ page }) => {

        await page.goto('/');

        // Open Login
        await page
            .getByLabel('Main navigation')
            .getByRole('link', { name: 'LOGIN' })
            .click();

        // Login with unpaid participant account
        await page
            .getByRole('textbox', { name: 'Email' })
            .fill(UNPAID_EMAIL);

        await page
            .getByRole('textbox', { name: 'Password' })
            .fill(UNPAID_PASSWORD);

        await page
            .getByRole('button', { name: 'SIGN IN' })
            .click();

        // Unpaid user should reach checkout
        await expect(page).toHaveURL(
            /#\/checkout$/,
            { timeout: 15000 }
        );

        // Accept checkout legal acknowledgements
        const selectAll = page.getByRole('checkbox', {
            name: 'SELECT ALL'
        });

        await expect(selectAll).toBeVisible();
        await selectAll.check();

        // Payment button should become available
        const paymentButton = page.getByRole('button', {
            name: 'PAY ₹499 WITH RAZORPAY'
        });

        await expect(paymentButton).toBeVisible();
        await expect(paymentButton).toBeEnabled();

        // Open Razorpay checkout
        await paymentButton.click();

        // Verify payment iframe appears
        const paymentFrame = page.locator('iframe').first();

        await expect(paymentFrame).toBeVisible({
            timeout: 15000
        });
    }
);