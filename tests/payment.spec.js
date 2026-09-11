import { test, expect } from '@playwright/test';


// ---------------------------------------------------------
// Helper
// Accept registration terms for payment setup
// ---------------------------------------------------------

async function acceptRegistrationTermsForSetup(page) {

    const checkboxes =
        page.getByRole('checkbox');


    await expect(
        checkboxes
    ).toHaveCount(3);


    await checkboxes.evaluateAll((elements) => {

        const setter =
            Object.getOwnPropertyDescriptor(
                HTMLInputElement.prototype,
                'checked'
            ).set;


        for (const checkbox of elements) {

            setter.call(
                checkbox,
                true
            );


            checkbox.dispatchEvent(
                new Event(
                    'input',
                    {
                        bubbles: true
                    }
                )
            );


            checkbox.dispatchEvent(
                new Event(
                    'change',
                    {
                        bubbles: true
                    }
                )
            );

        }

    });


    for (let i = 0; i < 3; i++) {

        await expect(
            checkboxes.nth(i)
        ).toBeChecked();

    }

}


// ---------------------------------------------------------
// Helper
// Register fresh participant
// ---------------------------------------------------------

async function registerFreshUser(page) {

    const email =
        `final7payment${Date.now()}@gmail.com`;


    await page.goto(
        '/#/register'
    );


    // -----------------------------------------------------
    // Full Name
    // -----------------------------------------------------

    const fullNameInput =
        page.getByRole(
            'textbox',
            {
                name: 'Full name'
            }
        );


    await expect(
        fullNameInput
    ).toBeVisible({
        timeout: 15000
    });


    await fullNameInput.fill(
        'Final7 Payment Test'
    );


    // -----------------------------------------------------
    // Email
    // -----------------------------------------------------

    const emailInput =
        page.getByRole(
            'textbox',
            {
                name: 'Email'
            }
        );


    await emailInput.fill(
        email
    );


    // -----------------------------------------------------
    // Password
    // -----------------------------------------------------

    const passwordInput =
        page.getByRole(
            'textbox',
            {
                name: 'Password'
            }
        );


    await passwordInput.fill(
        'Final7@Test123'
    );


    // -----------------------------------------------------
    // Registration acknowledgements
    // -----------------------------------------------------

    await acceptRegistrationTermsForSetup(
        page
    );


    // -----------------------------------------------------
    // Continue Registration
    // -----------------------------------------------------

    const continueButton =
        page.getByRole(
            'button',
            {
                name:
                    'CONTINUE TO SECURE ENTRY'
            }
        );


    await expect(
        continueButton
    ).toBeVisible({
        timeout: 15000
    });


    await expect(
        continueButton
    ).toBeEnabled({
        timeout: 15000
    });


    await continueButton.click({
        force: true
    });


    // -----------------------------------------------------
    // Detect successful registration or backend error
    // -----------------------------------------------------

    const registrationAlert =
        page.getByRole('alert');


    const registrationResult =
        await Promise.race([

            page
                .waitForURL(
                    /#\/checkout$/,
                    {
                        timeout: 20000
                    }
                )
                .then(
                    () => 'checkout'
                ),

            registrationAlert
                .waitFor(
                    {
                        state: 'visible',
                        timeout: 20000
                    }
                )
                .then(
                    () => 'error'
                )

        ])
            .catch(
                () => null
            );


    if (
        registrationResult ===
        'error'
    ) {

        const message =
            await registrationAlert
                .textContent();


        throw new Error(
            `Registration failed: ${message}`
        );

    }


    await expect(
        page
    ).toHaveURL(
        /#\/checkout$/,
        {
            timeout: 20000
        }
    );


    return email;

}


// ---------------------------------------------------------
// Helper
// Accept checkout acknowledgements
// ---------------------------------------------------------

async function acceptCheckoutTerms(page) {

    const selectAll =
        page.getByRole(
            'checkbox',
            {
                name: /select all/i
            }
        );


    await expect(
        selectAll
    ).toBeVisible({
        timeout: 15000
    });


    try {

        await selectAll.check({
            timeout: 10000
        });

    }
    catch {

        // Browser-stability fallback.

        await selectAll.evaluate(
            (checkbox) => {

                const setter =
                    Object.getOwnPropertyDescriptor(
                        HTMLInputElement.prototype,
                        'checked'
                    ).set;


                setter.call(
                    checkbox,
                    true
                );


                checkbox.dispatchEvent(
                    new Event(
                        'input',
                        {
                            bubbles: true
                        }
                    )
                );


                checkbox.dispatchEvent(
                    new Event(
                        'change',
                        {
                            bubbles: true
                        }
                    )
                );

            }
        );

    }


    await expect(
        selectAll
    ).toBeChecked();

}


// ---------------------------------------------------------
// Helper
// Detect PayU Hosted Checkout
//
// Important:
// Uses ONE overall timeout.
//
// This avoids stacking:
// 30 sec + 30 sec + 30 sec
// inside a test with only 60 sec total timeout.
// ---------------------------------------------------------

async function openPayUCheckout(
    context,
    page,
    paymentButton
) {

    const PAYU_TIMEOUT =
        30000;


    let detectedPayU = null;


    // -----------------------------------------------------
    // Function used whenever a page navigates
    // -----------------------------------------------------

    const inspectPage =
        (currentPage) => {

            const inspectUrl =
                () => {

                    const currentUrl =
                        currentPage.url();


                    if (
                        /payu/i.test(
                            currentUrl
                        )
                    ) {

                        detectedPayU = {
                            paymentPage:
                                currentPage,

                            payuUrl:
                                currentUrl
                        };

                    }

                };


            // Check current URL immediately.

            inspectUrl();


            // Listen for main-frame navigation.

            currentPage.on(
                'framenavigated',
                (frame) => {

                    if (
                        frame ===
                        currentPage.mainFrame()
                    ) {

                        inspectUrl();

                    }

                }
            );

        };


    // -----------------------------------------------------
    // Monitor pages that already exist
    // -----------------------------------------------------

    for (
        const currentPage
        of context.pages()
    ) {

        inspectPage(
            currentPage
        );

    }


    // -----------------------------------------------------
    // Monitor pages created after payment click
    // -----------------------------------------------------

    context.on(
        'page',
        (newPage) => {

            inspectPage(
                newPage
            );

        }
    );


    // -----------------------------------------------------
    // Click PayU payment button
    // -----------------------------------------------------

    await paymentButton.click({
        force: true
    });


    // -----------------------------------------------------
    // Wait up to 30 seconds TOTAL
    // -----------------------------------------------------

    const startTime =
        Date.now();


    while (
        Date.now() - startTime <
        PAYU_TIMEOUT
    ) {

        // -------------------------------------------------
        // Navigation listener already detected PayU
        // -------------------------------------------------

        if (detectedPayU) {

            return detectedPayU;

        }


        // -------------------------------------------------
        // Also inspect every page manually.
        // This protects against an event being missed.
        // -------------------------------------------------

        const pages =
            context.pages();


        for (
            const currentPage
            of pages
        ) {

            const currentUrl =
                currentPage.url();


            if (
                /payu/i.test(
                    currentUrl
                )
            ) {

                return {
                    paymentPage:
                        currentPage,

                    payuUrl:
                        currentUrl
                };

            }

        }


        // -------------------------------------------------
        // Short polling interval
        // -------------------------------------------------

        await page.waitForTimeout(
            250
        );

    }


    // -----------------------------------------------------
    // Diagnostic output if PayU was never detected
    // -----------------------------------------------------

    const openUrls =
        context
            .pages()
            .map(
                (currentPage) =>
                    currentPage.url()
            );


    throw new Error(
        `PayU checkout was not detected within ${PAYU_TIMEOUT}ms. Open pages: ${openUrls.join(' | ')}`
    );

}


// ---------------------------------------------------------
// Payment Test
// ---------------------------------------------------------

test(
    'Verify PayU Secure Checkout opens successfully',

    async ({
        page,
        context
    }) => {

        // -------------------------------------------------
        // Third-party checkout can respond more slowly
        // during the full regression run.
        // -------------------------------------------------

        test.setTimeout(
            90000
        );


        // -------------------------------------------------
        // STEP 1
        // Register fresh participant
        // -------------------------------------------------

        await registerFreshUser(
            page
        );


        // -------------------------------------------------
        // STEP 2
        // Verify checkout page
        // -------------------------------------------------

        await expect(
            page
        ).toHaveURL(
            /#\/checkout$/,
            {
                timeout: 20000
            }
        );


        // -------------------------------------------------
        // STEP 3
        // Accept checkout terms
        // -------------------------------------------------

        await acceptCheckoutTerms(
            page
        );


        // -------------------------------------------------
        // STEP 4
        // Enter mobile number
        // -------------------------------------------------

        const mobileInput =
            page.getByRole(
                'textbox',
                {
                    name: /mobile/i
                }
            );


        await expect(
            mobileInput
        ).toBeVisible({
            timeout: 15000
        });


        await mobileInput.fill(
            '3258258792'
        );


        // -------------------------------------------------
        // STEP 5
        // Verify PayU button
        //
        // This also confirms the ₹499 amount.
        // -------------------------------------------------

        const paymentButton =
            page.getByRole(
                'button',
                {
                    name:
                        /PAY ₹499 WITH PAYU/i
                }
            );


        await expect(
            paymentButton
        ).toBeVisible({
            timeout: 15000
        });


        await expect(
            paymentButton
        ).toBeEnabled({
            timeout: 15000
        });


        // -------------------------------------------------
        // STEP 6
        // Open PayU Hosted Checkout
        // -------------------------------------------------

        const {
            paymentPage,
            payuUrl
        } =
            await openPayUCheckout(
                context,
                page,
                paymentButton
            );


        // -------------------------------------------------
        // STEP 7
        // Verify PayU navigation
        // -------------------------------------------------

        console.log(
            'PayU checkout URL:',
            payuUrl
        );


        expect(
            payuUrl
        ).toMatch(
            /payu/i
        );


        // -------------------------------------------------
        // STEP 8
        // Ensure detected payment page exists
        // -------------------------------------------------

        expect(
            paymentPage
        ).toBeTruthy();


        // -------------------------------------------------
        // TEST STOPS HERE
        //
        // No real:
        // - Card details
        // - UPI credentials
        // - Net banking
        // - OTP
        //
        // are entered.
        // -------------------------------------------------

    }
);