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

        await checkbox.check({
            force: true
        });

        await expect(
            checkbox
        ).toBeChecked();
    }
}


// ---------------------------------------------------------
// Fresh Registration Helper
// ---------------------------------------------------------

async function registerFreshUser(page) {

    const testEmail =
        `final7checkout${Date.now()}@gmail.com`;

    await page.goto('/#/register');

    await page
        .getByRole(
            'textbox',
            {
                name: 'Full name'
            }
        )
        .fill(
            'Bhushan Checkout Test'
        );

    await page
        .getByRole(
            'textbox',
            {
                name: 'Email'
            }
        )
        .fill(
            testEmail
        );

    await page
        .getByRole(
            'textbox',
            {
                name: 'Password'
            }
        )
        .fill(
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
    ).toBeEnabled();

    await continueButton.click({
        force: true
    });

    await expect(page).toHaveURL(
        /#\/checkout$/,
        {
            timeout: 20000
        }
    );
}


// ---------------------------------------------------------
// TC-007
// Checkout Page
// ---------------------------------------------------------

test(
    'Verify checkout page displays correct PayU payment details',
    async ({ page }) => {

        await registerFreshUser(page);

        // -------------------------------------------------
        // Verify amount
        // -------------------------------------------------

        const totalPayable =
            page
                .getByText(
                    'Total payable',
                    {
                        exact: true
                    }
                )
                .locator('..');

        await expect(
            totalPayable.getByText(
                '₹499',
                {
                    exact: true
                }
            )
        ).toBeVisible({
            timeout: 15000
        });

        // -------------------------------------------------
        // Select Checkout Acknowledgements
        // -------------------------------------------------

        const selectAll =
            page.getByRole(
                'checkbox',
                {
                    name: 'SELECT ALL'
                }
            );

        await expect(
            selectAll
        ).toBeVisible();

        await selectAll.check({
            force: true
        });

        await expect(
            selectAll
        ).toBeChecked();

        // -------------------------------------------------
        // Mobile Number
        // -------------------------------------------------

        const mobileInput =
            page.getByRole(
                'textbox',
                {
                    name: 'Mobile number for PayU'
                }
            );

        await expect(
            mobileInput
        ).toBeVisible();

        await mobileInput.fill(
            '3258258792'
        );

        await expect(
            mobileInput
        ).toHaveValue(
            '3258258792'
        );

        // -------------------------------------------------
        // Payment Button
        // -------------------------------------------------

        const paymentButton =
            page.getByRole(
                'button',
                {
                    name: 'PAY ₹499 WITH PAYU'
                }
            );

        await expect(
            paymentButton
        ).toBeVisible();

        await expect(
            paymentButton
        ).toBeEnabled();
    }
);