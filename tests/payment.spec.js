import { test, expect } from '@playwright/test';

async function registerFreshUser(page) {

    const testEmail = `final7payment${Date.now()}@gmail.com`;

    await page.goto('/#/register');

    await page
        .getByRole('textbox', { name: 'Full name' })
        .fill('Bhushan Payment Test');

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


// TC-008
test('Verify PayU Secure Checkout opens successfully', async ({ page }) => {

    await registerFreshUser(page);

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

    await paymentButton.click();

    await expect(
        page.getByText('Secure Checkout', { exact: true })
    ).toBeVisible({
        timeout: 15000
    });

    await expect(
        page.getByRole('heading', {
            name: /Total Payable ₹499/i
        })
    ).toBeVisible();

    await expect(
        page.getByText(/Transaction Id:/i)
    ).toBeVisible();

});