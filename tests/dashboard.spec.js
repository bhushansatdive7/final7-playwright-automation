import { test, expect } from '@playwright/test';

const QA_EMAIL = process.env.FINAL7_QA_EMAIL;
const QA_PASSWORD = process.env.FINAL7_QA_PASSWORD;


// Reusable login helper
async function loginPaidUser(page) {

    await page.goto('/');

    await page
        .getByLabel('Main navigation')
        .getByRole('link', { name: 'LOGIN' })
        .click();

    await page
        .getByRole('textbox', { name: 'Email' })
        .fill(QA_EMAIL);

    await page
        .getByRole('textbox', { name: 'Password' })
        .fill(QA_PASSWORD);

    await page
        .getByRole('button', { name: 'SIGN IN' })
        .click();

    // Paid user should reach dashboard.
    // Unpaid users are sent to checkout.
    await expect(page).toHaveURL(
        /#\/dashboard$/,
        { timeout: 15000 }
    );

    await expect(
        page.getByText('PARTICIPANT DASHBOARD', {
            exact: true
        })
    ).toBeVisible();

    await expect(
        page.getByRole('button', {
            name: 'LOG OUT'
        })
    ).toBeVisible();
}


// TC-012
test(
    'Verify paid participant dashboard shows waiting event status',
    async ({ page }) => {

        await loginPaidUser(page);

        // Paid user reaching dashboard confirms
        // backend payment/access state is valid.
        await expect(page).toHaveURL(/#\/dashboard$/);

        // Event must still be waiting
        const waitingButton = page.getByRole('button', {
            name: 'WAITING FOR EVENT'
        });

        await expect(waitingButton).toBeVisible();

        // User must not enter before event starts
        await expect(waitingButton).toBeDisabled();
    }
);


// TC-013
test(
    'Verify paid participant session persists after page refresh',
    async ({ page }) => {

        await loginPaidUser(page);

        // Refresh browser
        await page.reload();

        // Session should survive refresh
        await expect(page).toHaveURL(
            /#\/dashboard$/,
            { timeout: 10000 }
        );

        await expect(
            page.getByText('PARTICIPANT DASHBOARD', {
                exact: true
            })
        ).toBeVisible();

        await expect(
            page.getByRole('button', {
                name: 'LOG OUT'
            })
        ).toBeVisible();
    }
);


// TC-014
test(
    'Verify logout removes participant session and protects dashboard',
    async ({ page }) => {

        await loginPaidUser(page);

        // Logout
        await page
            .getByRole('button', {
                name: 'LOG OUT'
            })
            .click();

        // Try protected route manually
        await page.goto('/#/dashboard');

        // Protected dashboard must not be exposed
        await expect(
            page.getByText('PARTICIPANT DASHBOARD', {
                exact: true
            })
        ).not.toBeVisible();

        await expect(
            page.getByRole('button', {
                name: 'LOG OUT'
            })
        ).not.toBeVisible();
    }
);


// TC-015
test(
    'Verify paid participant cannot start challenge before event window',
    async ({ page }) => {

        await loginPaidUser(page);

        const waitingButton = page.getByRole('button', {
            name: 'WAITING FOR EVENT'
        });

        await expect(waitingButton).toBeVisible();

        await expect(waitingButton).toBeDisabled();

        await expect(page).toHaveURL(
            /#\/dashboard$/
        );
    }
);


// Duplicate payment protection
test(
    'Verify paid participant cannot access checkout for duplicate payment',
    async ({ page }) => {

        await loginPaidUser(page);

        // Paid participant manually tries checkout
        await page.goto('/#/checkout');

        // Application should return paid user to dashboard
        await expect(page).toHaveURL(
            /#\/dashboard$/,
            { timeout: 10000 }
        );

        // Another payment opportunity must not appear
        await expect(
            page.getByRole('button', {
                name: 'PAY ₹499 WITH RAZORPAY'
            })
        ).not.toBeVisible();

        await expect(
            page.getByText('PARTICIPANT DASHBOARD', {
                exact: true
            })
        ).toBeVisible();
    }
);
