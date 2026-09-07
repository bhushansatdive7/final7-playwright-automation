# Final7 Playwright Automation

[![Final7 Playwright Tests](https://github.com/bhushansatdive7/final7-playwright-automation/actions/workflows/playwright.yml/badge.svg)](https://github.com/bhushansatdive7/final7-playwright-automation/actions/workflows/playwright.yml)

End-to-end automation testing project for **THE FINAL 7** web application using **Playwright and JavaScript**.

The project covers critical user journeys including registration, authentication, access control, participant dashboard behavior, checkout validation, and PayU payment gateway integration.

Live application under test:

```text
https://thefinal7.online
```

---

## Tech Stack

- Playwright
- JavaScript
- Node.js
- Git
- GitHub
- GitHub Actions
- Chromium
- Firefox
- WebKit

---

## Current Test Status

Validated Chromium regression suite:

```text
14 tests
14 passed
0 skipped
0 failed
```

Tests are executed sequentially against the live backend using:

```bash
playwright test --project=chromium --workers=1
```

---

## Test Coverage

| Module | Tests |
|---|---:|
| Smoke | 1 |
| Landing Page | 1 |
| Registration | 2 |
| Login | 2 |
| Access Control | 1 |
| Participant Dashboard | 5 |
| Checkout | 1 |
| PayU Payment | 1 |
| **Total** | **14** |

---

## Smoke Testing

The smoke test verifies that the production website:

- Responds successfully
- Loads the expected URL
- Displays the expected page title
- Renders the page body correctly

---

## Landing Page

Automated coverage includes:

- Homepage navigation
- Verification of the **REGISTER NOW** CTA
- Navigation from the landing page to the registration page

---

## Registration

Registration automation covers:

- Fresh user registration
- Dynamic unique email generation using timestamps
- Required registration fields
- Legal acknowledgement checkboxes
- Successful navigation from registration to checkout
- Negative validation when Full Name is missing

Fresh test users are generated dynamically to avoid duplicate-account conflicts.

Example:

```js
const testEmail = `final7qa${Date.now()}@gmail.com`;
```

---

## Authentication

Login automation covers:

- Successful login with a valid QA participant
- Invalid credential validation
- Verification of the `LOG OUT` control
- Environment-based credential handling

Sensitive credentials are stored in environment variables rather than committed to source control.

Required variables:

```env
FINAL7_QA_EMAIL=your_paid_test_email_here
FINAL7_QA_PASSWORD=your_paid_test_password_here
```

Tests provide a clear configuration error when required QA credentials are missing.

---

## Access Control

Access-control automation verifies that protected participant routes cannot be accessed by logged-out users.

Current regression coverage verifies:

```text
Logged-out user
        ↓
Opens /#/dashboard
        ↓
Application checks authentication
        ↓
Redirected to /#/login
```

The test also verifies that protected participant dashboard content is not exposed.

---

## Participant Dashboard

Dashboard automation covers:

- Paid participant dashboard access
- Participant session persistence after browser refresh
- Logout and session removal
- Protected dashboard behavior after logout
- Prevention of challenge access before the event window
- Duplicate payment protection for already-paid participants

The suite verifies that paid participants are not presented with another:

```text
PAY ₹499 WITH PAYU
```

payment opportunity.

---

## Checkout

Checkout automation creates a fresh participant and verifies the current production checkout flow.

Coverage includes:

- Successful registration-to-checkout navigation
- ₹499 participation fee validation
- Required legal acknowledgements
- `SELECT ALL` acknowledgement control
- PayU mobile-number field
- `PAY ₹499 WITH PAYU` button
- Payment button availability after required information is completed

---

## PayU Payment Integration

The payment automation validates the current **PayU Hosted Checkout** integration.

Coverage includes:

- Fresh participant creation
- Checkout acknowledgements
- PayU mobile-number input
- Payment button availability
- Successful launch of PayU Secure Checkout
- ₹499 payable amount
- Transaction ID generation

The automated test intentionally stops at the hosted payment checkout.

It does **not** enter real banking, card, UPI, or other financial credentials and does not complete an actual payment.

---

## Defect Verification

During testing, multiple production defects were identified, reported, fixed, and regression-tested.

### BUG-001 — Registration Legal-Version Mismatch

**Severity:** Critical

**Status:** CLOSED — Fixed and verified

Fresh user registration was previously blocked because the frontend and backend legal document identity were not synchronized.

Previously observed message:

```text
The legal document version changed. Reload the page and review the current terms.
```

After the application fix:

- Current legal version and hash are synchronized
- Fresh registration succeeds
- Legal acceptance is recorded
- Participant proceeds to checkout
- Automated registration regression now passes

---

### BUG-002 — Checkout / Payment Configuration Blocker

**Severity:** Critical

**Status:** CLOSED — Fixed and verified

Paid checkout was previously blocked because required Organizer, customer-care, grievance, and payment configuration was incomplete.

Previously observed behavior:

```text
Paid checkout is blocked until required Organizer/customer-care/grievance
disclosures are configured and payments are explicitly enabled.
```

After the application fix:

- Required compliance configuration is available
- Payments are enabled
- Checkout acknowledgements work correctly
- ₹499 payment action becomes available
- The application successfully reaches PayU Secure Checkout

The previous Razorpay payment integration has been retired.

Current automation validates the **PayU Hosted Checkout** implementation.

---

### BUG-003 — Unauthenticated Dashboard Routing

**Severity:** Medium

**Priority:** High

**Status:** CLOSED — Fixed and verified

Unauthenticated users previously opening:

```text
/#/dashboard
```

received a raw application error instead of being redirected to login.

Previously observed error:

```text
Edge Function returned a non-2xx status code
```

After the fix:

- Authentication is checked before protected dashboard API calls
- Logged-out users are redirected to `/#/login`
- Raw Edge Function errors are no longer shown in this flow
- Protected participant information remains inaccessible
- Automated access-control regression passes

---

## Project Structure

```text
final7-playwright-automation/
│
├── tests/
│   ├── access-control.spec.js
│   ├── checkout.spec.js
│   ├── dashboard.spec.js
│   ├── landing.spec.js
│   ├── login.spec.js
│   ├── payment.spec.js
│   ├── register.spec.js
│   └── smoke.spec.js
│
├── .github/
│   └── workflows/
│       └── playwright.yml
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── playwright.config.js
└── README.md
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/bhushansatdive7/final7-playwright-automation.git
```

Open the project:

```bash
cd final7-playwright-automation
```

Install dependencies:

```bash
npm install
```

Install Playwright browsers:

```bash
npx playwright install
```

---

## Environment Setup

Create a local `.env` file.

Example:

```env
FINAL7_QA_EMAIL=your_paid_test_email_here
FINAL7_QA_PASSWORD=your_paid_test_password_here
```

The real `.env` file is excluded from Git.

Never commit real QA credentials.

---

## Running Tests

### Run all configured browser projects

```bash
npm test
```

### Run the validated Chromium regression suite

```bash
npm run test:chromium
```

### Run Chromium in headed mode

```bash
npm run test:headed
```

### Run one test file

Example:

```bash
npx playwright test tests/login.spec.js --project=chromium --workers=1
```

### List all Chromium tests

```bash
npx playwright test --list --project=chromium
```

---

## HTML Report

Open the Playwright HTML report:

```bash
npm run report
```

Playwright is configured to retain useful debugging artifacts for failures, including:

- Screenshots
- Video
- Trace information

---

## Continuous Integration

GitHub Actions runs the Chromium regression suite automatically on:

- Pushes to `main`
- Pull requests targeting `main`

The CI workflow:

- Installs Node.js dependencies
- Installs Chromium
- Loads QA credentials from GitHub Secrets
- Runs tests sequentially using one worker
- Generates a Playwright HTML report
- Uploads the report as a workflow artifact

GitHub Secrets used by CI:

```text
FINAL7_QA_EMAIL
FINAL7_QA_PASSWORD
```

---

## Automation Practices Demonstrated

This project demonstrates practical Playwright automation concepts including:

- End-to-end testing
- Positive testing
- Negative testing
- Smoke testing
- Authentication testing
- Access-control testing
- Checkout testing
- External payment gateway validation
- Role-based locators
- Accessible selectors
- Dynamic test-data generation
- Environment variables
- Reusable helper functions
- Async Playwright assertions
- URL validation
- Session validation
- GitHub Actions CI
- HTML reporting
- Screenshots on failure
- Video on failure
- Playwright traces
- Sequential execution against a live backend

---

## Production Testing Considerations

Some tests interact with the live application backend.

Fresh-registration tests can create real test participant records, and PayU checkout tests can create payment transaction records.

For this reason:

- Tests are executed with `--workers=1`
- No real payment is completed
- Real financial credentials are never entered
- Production gateway testing is limited to validating checkout availability and launch

For a larger production automation framework, these tests should eventually run against a dedicated staging environment with controlled test data and cleanup.

---

## Future Improvements

Planned framework improvements include:

- Page Object Model
- Custom Playwright fixtures
- Centralized test-data utilities
- Authentication fixtures
- Reusable registration helpers
- Staging/test payment environment
- Automated test-data cleanup
- Additional cross-browser regression
- API-level setup for test users
- Expanded challenge-flow automation
- CI test tagging and environment-based execution

---

## Portfolio Highlights

This project demonstrates an end-to-end QA workflow:

```text
Requirement understanding
        ↓
Manual testing
        ↓
Defect discovery
        ↓
Bug reporting
        ↓
Developer fix
        ↓
Manual verification
        ↓
Playwright regression automation
        ↓
Full regression execution
        ↓
GitHub Actions CI
```

The project includes real examples of production defects being discovered, fixed, and converted into automated regression coverage.

---

## Author

**Bhushan Satdive**

GitHub:

```text
bhushansatdive7
```

---

## Project Purpose

This project was created as a hands-on QA automation portfolio project to demonstrate practical experience with **Playwright, JavaScript, end-to-end testing, defect verification, payment-flow testing, and CI/CD integration**.