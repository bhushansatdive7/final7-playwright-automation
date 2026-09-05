import { test, expect } from '@playwright/test';

const QA_EMAIL = process.env.FINAL7_QA_EMAIL;
const QA_PASSWORD = process.env.FINAL7_QA_PASSWORD;


// TC-005
test('Verify existing user can login successfully', async ({ page }) => {

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

    // Successful login should remove user from login page
    await expect(page).not.toHaveURL(
        /#\/login$/
    );

    // Logged-in navigation should show LOG OUT
    await expect(
        page.getByRole('button', { name: 'LOG OUT' })
    ).toBeVisible();

});


// TC-006
test('Verify login fails with invalid credentials', async ({ page }) => {

    await page.goto('/');

    await page
        .getByLabel('Main navigation')
        .getByRole('link', { name: 'LOGIN' })
        .click();

    // Intentionally invalid test data
    await page
        .getByRole('textbox', { name: 'Email' })
        .fill('invaliduser@example.com');

    await page
        .getByRole('textbox', { name: 'Password' })
        .fill('InvalidPassword123!');

    await page
        .getByRole('button', { name: 'SIGN IN' })
        .click();

    // Invalid user must remain on login page
    await expect(page).toHaveURL(
        /#\/login$/
    );

    // Correct validation message must appear
    await expect(
        page.getByText(
            'Invalid login credentials',
            { exact: true }
        )
    ).toBeVisible();

});