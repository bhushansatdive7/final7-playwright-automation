import { test, expect } from '@playwright/test';

async function registerFreshUser(page) {

    const testEmail = `final7checkout${Date.now()}@gmail.com`;

    await page.goto('/#/register');

    await page
        .getByRole('textbox', { name: 'Full name' })
        .fill('Bhushan Checkout Test');

    await page
        .getByRole('textbox', { name: 'Email' })
        .fill(testEmail);

    await page
        .getByRole('textbox', { name: 'Password' })
        .fill('Final7@Test123');

    const checkboxes = page.getByRole('checkbox');

    await expect(checkboxes).toHaveCount(3);

    await checkboxes.nth(0).check();
    await checkboxes.nth(1).check();
    await checkboxes.nth(2).check();

    await page
        .getByRole('button', {
            name: 'CONTINUE TO SECURE ENTRY'
        })
        .click();

    await expect(page).toHaveURL(
        /#\/checkout$/,
        { timeout: 15000 }
    );
}


// TC-007
test('Verify checkout page displays correct PayU payment details', async ({ page }) => {

    await registerFreshUser(page);

    const totalPayable = page
        .getByText('Total payable', { exact: true })
        .locator('..');

    await expect(
        totalPayable.getByText('₹499', { exact: true })
    ).toBeVisible();

    const selectAll = page.getByRole('checkbox', {
        name: 'SELECT ALL'
    });

    await expect(selectAll).toBeVisible();
    await selectAll.check();

    const mobileInput = page.getByRole('textbox', {
        name: 'Mobile number for PayU'
    });

    await expect(mobileInput).toBeVisible();
    await mobileInput.fill('3258258792');

    const paymentButton = page.getByRole('button', {
        name: 'PAY ₹499 WITH PAYU'
    });

    await expect(paymentButton).toBeVisible();
    await expect(paymentButton).toBeEnabled();

});