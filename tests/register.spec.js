import { test, expect } from '@playwright/test';


// ---------------------------------------------------------
// Registration Terms Helper
// ---------------------------------------------------------

async function acceptRegistrationTerms(page) {

    const checkboxes =
        page.getByRole('checkbox');

    await expect(checkboxes).toHaveCount(3);

    for (let i = 0; i < 3; i++) {

        const checkbox =
            checkboxes.nth(i);

        // WebKit detects the checkbox correctly but the
        // custom UI can keep it in an "unstable" state.
        await checkbox.check({
            force: true
        });

        // Verify the action actually succeeded.
        await expect(
            checkbox
        ).toBeChecked();
    }
}


// ---------------------------------------------------------
// TC-003
// Successful Registration
// ---------------------------------------------------------

test(
    'Verify new user can register successfully',
    async ({ page }) => {

        await page.goto('/#/register');

        const testEmail =
            `final7qa${Date.now()}@gmail.com`;

        const fullNameInput =
            page.getByRole(
                'textbox',
                {
                    name: 'Full name'
                }
            );

        const emailInput =
            page.getByRole(
                'textbox',
                {
                    name: 'Email'
                }
            );

        const passwordInput =
            page.getByRole(
                'textbox',
                {
                    name: 'Password'
                }
            );

        await fullNameInput.fill(
            'Bhushan Test'
        );

        await emailInput.fill(
            testEmail
        );

        await passwordInput.fill(
            'Final7@Test123'
        );

        await acceptRegistrationTerms(page);

        const continueButton =
            page.getByRole(
                'button',
                {
                    name: 'CONTINUE TO SECURE ENTRY'
                }
            );

        await expect(
            continueButton
        ).toBeVisible();

        await expect(
            continueButton
        ).toBeEnabled();

        await continueButton.click({
            force: true
        });

        // Successful registration must reach checkout.
        await expect(page).toHaveURL(
            /#\/checkout$/,
            {
                timeout: 20000
            }
        );
    }
);


// ---------------------------------------------------------
// TC-004
// Registration Without Full Name
// ---------------------------------------------------------

test(
    'Verify user cannot register without full name',
    async ({ page }) => {

        await page.goto('/#/register');

        const testEmail =
            `final7negative${Date.now()}@gmail.com`;

        const emailInput =
            page.getByRole(
                'textbox',
                {
                    name: 'Email'
                }
            );

        const passwordInput =
            page.getByRole(
                'textbox',
                {
                    name: 'Password'
                }
            );

        await emailInput.fill(
            testEmail
        );

        await passwordInput.fill(
            'Final7@Test123'
        );

        await acceptRegistrationTerms(page);

        const continueButton =
            page.getByRole(
                'button',
                {
                    name: 'CONTINUE TO SECURE ENTRY'
                }
            );

        await expect(
            continueButton
        ).toBeVisible();

        await continueButton.click({
            force: true
        });

        // Invalid registration should stay
        // on registration page.
        await expect(page).toHaveURL(
            /#\/register$/,
            {
                timeout: 10000
            }
        );
    }
);