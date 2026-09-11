import { test, expect } from '@playwright/test';


// ---------------------------------------------------------
// QA Credentials
// ---------------------------------------------------------

const QA_EMAIL =
    process.env.FINAL7_QA_EMAIL;

const QA_PASSWORD =
    process.env.FINAL7_QA_PASSWORD;


if (!QA_EMAIL || !QA_PASSWORD) {

    throw new Error(
        'Missing FINAL7_QA_EMAIL or FINAL7_QA_PASSWORD environment variables.'
    );
}


// ---------------------------------------------------------
// TC-005
// Verify existing user can login successfully
// ---------------------------------------------------------

test(
    'Verify existing user can login successfully',

    async ({ page }) => {

        // -------------------------------------------------
        // Open Login Page
        // -------------------------------------------------

        await page.goto('/#/login');


        await expect(
            page
        ).toHaveURL(
            /#\/login$/
        );


        // -------------------------------------------------
        // Email
        // -------------------------------------------------

        const emailInput =
            page.getByRole(
                'textbox',
                {
                    name: 'Email'
                }
            );


        await expect(
            emailInput
        ).toBeVisible();


        await emailInput.fill(
            QA_EMAIL
        );


        // -------------------------------------------------
        // Password
        // -------------------------------------------------

        const passwordInput =
            page.getByRole(
                'textbox',
                {
                    name: 'Password'
                }
            );


        await expect(
            passwordInput
        ).toBeVisible();


        await passwordInput.fill(
            QA_PASSWORD
        );


        // -------------------------------------------------
        // Sign In
        // -------------------------------------------------

        const signInButton =
            page.getByRole(
                'button',
                {
                    name: 'SIGN IN'
                }
            );


        await expect(
            signInButton
        ).toBeVisible();


        await expect(
            signInButton
        ).toBeEnabled();


        // Submit using Enter.
        // This has been more stable across browsers,
        // especially WebKit with the animated login button.

        await passwordInput.press(
            'Enter'
        );


        // -------------------------------------------------
        // Verify Dashboard Navigation
        // -------------------------------------------------

        await expect(
            page
        ).toHaveURL(
            /#\/dashboard$/,
            {
                timeout: 15000
            }
        );


        // -------------------------------------------------
        // Verify Dashboard Content
        // -------------------------------------------------

        await expect(
            page.getByText(
                'PARTICIPANT DASHBOARD',
                {
                    exact: true
                }
            )
        ).toBeVisible({
            timeout: 15000
        });


        // -------------------------------------------------
        // Verify Logged-In State
        // -------------------------------------------------

        await expect(
            page.getByRole(
                'button',
                {
                    name: 'LOG OUT'
                }
            )
        ).toBeVisible({
            timeout: 15000
        });

    }
);


// ---------------------------------------------------------
// TC-006
// Verify login fails with invalid credentials
// ---------------------------------------------------------

test(
    'Verify login fails with invalid credentials',

    async ({ page }) => {

        // -------------------------------------------------
        // Open Login Page
        // -------------------------------------------------

        await page.goto('/#/login');


        await expect(
            page
        ).toHaveURL(
            /#\/login$/
        );


        // -------------------------------------------------
        // Email
        // -------------------------------------------------

        const emailInput =
            page.getByRole(
                'textbox',
                {
                    name: 'Email'
                }
            );


        await emailInput.fill(
            'invaliduser@example.com'
        );


        // -------------------------------------------------
        // Password
        // -------------------------------------------------

        const passwordInput =
            page.getByRole(
                'textbox',
                {
                    name: 'Password'
                }
            );


        await passwordInput.fill(
            'InvalidPassword123!'
        );


        // -------------------------------------------------
        // Sign In
        // -------------------------------------------------

        const signInButton =
            page.getByRole(
                'button',
                {
                    name: 'SIGN IN'
                }
            );


        await expect(
            signInButton
        ).toBeVisible();


        await expect(
            signInButton
        ).toBeEnabled();


        await passwordInput.press(
            'Enter'
        );


        // -------------------------------------------------
        // Verify User Remains On Login Page
        // -------------------------------------------------

        await expect(
            page
        ).toHaveURL(
            /#\/login$/,
            {
                timeout: 10000
            }
        );


        // -------------------------------------------------
        // Verify Error Message
        // -------------------------------------------------

        await expect(
            page.getByText(
                'Invalid login credentials',
                {
                    exact: true
                }
            )
        ).toBeVisible({
            timeout: 10000
        });


        // -------------------------------------------------
        // Verify Protected Dashboard Is Not Visible
        // -------------------------------------------------

        await expect(
            page.getByText(
                'PARTICIPANT DASHBOARD',
                {
                    exact: true
                }
            )
        ).not.toBeVisible();

    }
);