import { test, expect } from '@playwright/test';


// Reusable helper for the 3 registration checkboxes
async function acceptRegistrationTerms(page) {

    const checkboxes = page.getByRole('checkbox');

    // Registration page currently has 3 required checkboxes
    await expect(checkboxes).toHaveCount(3);

    await checkboxes.nth(0).check();
    await checkboxes.nth(1).check();
    await checkboxes.nth(2).check();
}


// TC-003
test.fixme('Verify new user can register successfully', async ({ page }) => {

    await page.goto('/#/register');

    // Fresh email every run
    const testEmail = `final7qa${Date.now()}@gmail.com`;

    await page
        .getByRole('textbox', { name: 'Full name' })
        .fill('Bhushan Test');

    await page
        .getByRole('textbox', { name: 'Email' })
        .fill(testEmail);

    await page
        .getByRole('textbox', { name: 'Password' })
        .fill('Final7@Test123');

    // Accept all required registration acknowledgements
    await acceptRegistrationTerms(page);

    const continueButton = page.getByRole('button', {
        name: 'CONTINUE TO SECURE ENTRY'
    });

    await expect(continueButton).toBeVisible();
    await expect(continueButton).toBeEnabled();

    await continueButton.click();

    // Wait for backend registration to finish
    try {

        await page.waitForURL('**/#/checkout', {
            timeout: 15000
        });

    } catch (error) {

        console.log('\n');
        console.log('========== REGISTRATION DEBUG ==========');

        console.log(
            await page.locator('main').innerText()
        );

        console.log('Current URL:', page.url());

        console.log('========================================');
        console.log('\n');

        throw new Error(
            `Registration did not reach checkout. Current URL: ${page.url()}`
        );
    }

    await expect(page).toHaveURL(
        'https://thefinal7.online/#/checkout'
    );

});


// TC-004
test('Verify user cannot register without full name', async ({ page }) => {

    await page.goto('/#/register');

    const testEmail = `final7qa${Date.now()}@gmail.com`;

    // Full name intentionally left empty

    await page
        .getByRole('textbox', { name: 'Email' })
        .fill(testEmail);

    await page
        .getByRole('textbox', { name: 'Password' })
        .fill('Final7@Test123');

    await acceptRegistrationTerms(page);

    const continueButton = page.getByRole('button', {
        name: 'CONTINUE TO SECURE ENTRY'
    });

    await expect(continueButton).toBeVisible();

    await continueButton.click();

    // Invalid registration must remain on register page
    await expect(page).toHaveURL(
        'https://thefinal7.online/#/register'
    );

});