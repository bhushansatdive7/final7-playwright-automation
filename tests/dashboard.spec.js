import { test, expect } from '@playwright/test';

const BASE_URL = 'https://thefinal7.online';

test.describe('FINAL 7 Dashboard Security - BUG-003', () => {

    test.beforeEach(async ({ page }) => {

        // Start from a clean public page.
        await page.goto(`${BASE_URL}/#/`, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        // Remove all browser-side participant/session state.
        await page.evaluate(() => {

            localStorage.clear();
            sessionStorage.clear();

        });
    });


    /*
    |--------------------------------------------------------------------------
    | TEST 1
    | Direct unauthenticated dashboard access
    |--------------------------------------------------------------------------
    */

    test(
        'Unauthenticated user cannot directly access dashboard',
        async ({ page }) => {

            await page.goto(
                `${BASE_URL}/#/dashboard`,
                {
                    waitUntil: 'domcontentloaded',
                    timeout: 30000
                }
            );

            await expect(page).toHaveURL(
                /#\/login$/,
                {
                    timeout: 20000
                }
            );

            await expect(
                page.getByRole('heading', {
                    name: /RETURN TO THE SYSTEM/i
                })
            ).toBeVisible();

            await expect(
                page.getByText(
                    /PARTICIPANT DASHBOARD/i
                )
            ).toHaveCount(0);
        }
    );


    /*
    |--------------------------------------------------------------------------
    | TEST 2
    | Explicit logout marker protects dashboard
    |--------------------------------------------------------------------------
    */

    test(
        'Signed-out browser cannot access dashboard',
        async ({ page }) => {

            // This is the state created by the real logout function.
            await page.evaluate(() => {

                localStorage.setItem(
                    'tf7_signed_out',
                    '1'
                );

            });

            await page.goto(
                `${BASE_URL}/#/dashboard`,
                {
                    waitUntil: 'domcontentloaded',
                    timeout: 30000
                }
            );

            await expect(page).toHaveURL(
                /#\/login$/,
                {
                    timeout: 20000
                }
            );

            await expect(
                page.getByText(
                    /PARTICIPANT DASHBOARD/i
                )
            ).toHaveCount(0);
        }
    );


    /*
    |--------------------------------------------------------------------------
    | TEST 3
    | Stale local participant/session data must not bypass logout
    |--------------------------------------------------------------------------
    */

    test(
        'Stale participant data cannot bypass dashboard protection after logout',
        async ({ page }) => {

            await page.evaluate(() => {

                /*
                 * Simulate stale WebKit browser data.
                 */

                localStorage.setItem(
                    'tf7_participant',
                    JSON.stringify({
                        id: 'fake-user',
                        name: 'STALE USER',
                        email: 'stale@example.com'
                    })
                );

                localStorage.setItem(
                    'tf7_session',
                    JSON.stringify({
                        id: 'fake-session',
                        status: 'active'
                    })
                );

                /*
                 * Important:
                 * browser was explicitly logged out.
                 */
                localStorage.setItem(
                    'tf7_signed_out',
                    '1'
                );

            });

            await page.goto(
                `${BASE_URL}/#/dashboard`,
                {
                    waitUntil: 'domcontentloaded',
                    timeout: 30000
                }
            );

            await expect(page).toHaveURL(
                /#\/login$/,
                {
                    timeout: 20000
                }
            );

            await expect(
                page.getByText(
                    /PARTICIPANT DASHBOARD/i
                )
            ).toHaveCount(0);

            await expect(
                page.getByRole('heading', {
                    name: /WELCOME,/i
                })
            ).toHaveCount(0);
        }
    );


    /*
    |--------------------------------------------------------------------------
    | TEST 4
    | Simulate stale Supabase auth storage in WebKit
    |--------------------------------------------------------------------------
    */

    test(
        'Stale Supabase browser auth cache cannot reopen dashboard after logout',
        async ({ page }) => {

            await page.evaluate(() => {

                /*
                 * Simulates the type of stale auth-storage condition
                 * that caused BUG-003 in WebKit/Safari.
                 */

                localStorage.setItem(
                    'sb-final7-auth-token',
                    JSON.stringify({
                        access_token: 'stale-token',
                        refresh_token: 'stale-refresh-token',
                        user: {
                            id: 'stale-user'
                        }
                    })
                );

                /*
                 * Logout marker takes priority.
                 */
                localStorage.setItem(
                    'tf7_signed_out',
                    '1'
                );

            });

            await page.goto(
                `${BASE_URL}/#/dashboard`,
                {
                    waitUntil: 'domcontentloaded',
                    timeout: 30000
                }
            );

            await expect(page).toHaveURL(
                /#\/login$/,
                {
                    timeout: 20000
                }
            );

            await expect(
                page.getByRole('heading', {
                    name: /RETURN TO THE SYSTEM/i
                })
            ).toBeVisible();

            await expect(
                page.getByText(
                    /PARTICIPANT DASHBOARD/i
                )
            ).toHaveCount(0);
        }
    );


    /*
    |--------------------------------------------------------------------------
    | TEST 5
    | Refresh must not restore protected dashboard
    |--------------------------------------------------------------------------
    */

    test(
        'Dashboard remains protected after reload in WebKit',
        async ({ page }) => {

            await page.evaluate(() => {

                localStorage.setItem(
                    'tf7_signed_out',
                    '1'
                );

            });

            /*
             * Attempt unauthorized access.
             */
            await page.goto(
                `${BASE_URL}/#/dashboard`,
                {
                    waitUntil: 'domcontentloaded',
                    timeout: 30000
                }
            );

            /*
             * Should immediately leave dashboard.
             */
            await expect(page).toHaveURL(
                /#\/login$/,
                {
                    timeout: 20000
                }
            );


            /*
             * Reload browser.
             */
            await page.reload({
                waitUntil: 'domcontentloaded',
                timeout: 30000
            });


            /*
             * WebKit must still remain logged out.
             */
            await expect(page).toHaveURL(
                /#\/login$/,
                {
                    timeout: 20000
                }
            );


            /*
             * Try dashboard again after reload.
             */
            await page.goto(
                `${BASE_URL}/#/dashboard`,
                {
                    waitUntil: 'domcontentloaded',
                    timeout: 30000
                }
            );


            /*
             * Must again redirect to login.
             */
            await expect(page).toHaveURL(
                /#\/login$/,
                {
                    timeout: 20000
                }
            );


            /*
             * Protected content must never appear.
             */
            await expect(
                page.getByText(
                    /PARTICIPANT DASHBOARD/i
                )
            ).toHaveCount(0);
        }
    );

});