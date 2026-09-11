# Final7 Playwright Automation

[![Final7 Playwright Tests](https://github.com/bhushansatdive7/final7-playwright-automation/actions/workflows/playwright.yml/badge.svg)](https://github.com/bhushansatdive7/final7-playwright-automation/actions/workflows/playwright.yml)

End-to-end automation testing project for **THE FINAL 7** web application using **Playwright and JavaScript**.

This project covers critical production user journeys including registration, authentication, access control, participant dashboard behavior, checkout validation, and PayU payment gateway integration.

The project also demonstrates a complete QA workflow: identifying production defects, documenting them, verifying fixes, and converting important scenarios into automated regression coverage.

---

## Application Under Test

**THE FINAL 7**

https://thefinal7.online

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
- PayU Hosted Checkout

---

## Current Test Status

### Full Cross-Browser Regression

```text
42 tests
42 passed
0 skipped
0 failed
```

The project currently contains **14 automated test cases**.

Each test case is executed across three browser engines:

```text
14 test cases × 3 browsers = 42 test executions
```

Browser coverage:

```text
Chromium    14/14 passed
Firefox     14/14 passed
WebKit      14/14 passed
-----------------------
Total       42/42 passed
```

The complete cross-browser regression suite is executed sequentially against the live application using:

```bash
npx playwright test --workers=1
```

Sequential execution is intentionally used because several tests interact with the live backend and create real test participant records.

---

## Test Coverage

| Module | Test Cases |
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

These 14 test cases are executed across Chromium, Firefox, and WebKit, resulting in **42 total test executions**.

---

# Test Modules

## 1. Smoke Testing

The smoke test verifies that the production application:

- Responds successfully
- Loads the expected application URL
- Displays the expected page title
- Renders the application body correctly
- Is available for further functional testing

---

## 2. Landing Page

Landing-page automation verifies:

- Homepage navigation
- Availability of the registration CTA
- `REGISTER NOW` functionality
- Successful navigation from the landing page to registration

---

## 3. Registration

Registration automation covers both positive and negative scenarios.

### Positive Registration

The test verifies:

- Registration page loads successfully
- Full Name can be entered
- Email can be entered
- Password can be entered
- Required legal acknowledgements can be accepted
- Registration request succeeds
- Fresh participant reaches checkout

### Dynamic Test Data

Unique email addresses are generated using timestamps:

```js
const testEmail = `final7qa${Date.now()}@gmail.com`;
```

This reduces duplicate-account conflicts during repeated automation runs.

### Negative Registration

The registration suite also verifies validation when required participant information such as **Full Name** is missing.

---

## 4. Authentication

Authentication automation covers:

- Valid participant login
- Invalid credential validation
- Successful authenticated navigation
- Logged-in state verification
- `LOG OUT` control verification

Valid QA credentials are stored in environment variables rather than hard-coded in the repository.

Required environment variables:

```env
FINAL7_QA_EMAIL=your_paid_test_email_here
FINAL7_QA_PASSWORD=your_paid_test_password_here
```

This keeps sensitive QA credentials outside source control.

---

## 5. Access Control

Access-control automation verifies that protected participant functionality cannot be accessed by unauthenticated users.

The primary protected-route scenario is:

```text
Logged-out user
        ↓
Opens /#/dashboard
        ↓
Application checks authentication
        ↓
User is prevented from accessing protected dashboard
        ↓
Login flow is presented
```

The automation also verifies that protected participant dashboard information is not exposed to an unauthenticated browser session.

This test provides regression coverage for **BUG-003**.

---

## 6. Participant Dashboard

Dashboard automation covers critical authenticated participant behavior.

Coverage includes:

- Paid participant dashboard access
- Participant session persistence after browser refresh
- Logout and session removal
- Protected dashboard behavior after logout
- Challenge access restrictions before the event window
- Duplicate-payment protection

### Event Access Protection

The suite verifies that participants cannot start the challenge before the configured event window.

The expected state includes:

```text
WAITING FOR EVENT
```

The control remains unavailable until the application allows event participation.

### Duplicate Payment Protection

For an already-paid participant, automation verifies that another:

```text
PAY ₹499 WITH PAYU
```

payment opportunity is not presented.

This protects participants from accidentally attempting duplicate payments.

---

## 7. Checkout

Checkout automation creates a fresh test participant and validates the current production checkout flow.

Coverage includes:

- Registration-to-checkout navigation
- ₹499 participation fee
- Required checkout acknowledgements
- `SELECT ALL` acknowledgement control
- PayU mobile-number field
- `PAY ₹499 WITH PAYU` button
- Payment button availability after required checkout information is completed

The test validates that the application is ready to initiate the payment process.

---

## 8. PayU Hosted Checkout

The payment automation validates the production **PayU Hosted Checkout** integration.

Coverage includes:

- Fresh participant creation
- Successful registration-to-checkout navigation
- Required checkout acknowledgements
- PayU mobile-number input
- ₹499 PayU payment button validation
- Successful handoff from Final7 to PayU
- Detection of PayU Hosted Checkout navigation
- Cross-browser payment-gateway handoff validation
- Chromium support
- Firefox support
- WebKit support

### Cross-Browser PayU Handling

External payment gateways may behave differently between browser engines.

The automation therefore handles PayU navigation without relying on brittle third-party page text.

The test detects successful PayU navigation and captures the hosted checkout URL when it appears.

Example:

```text
https://api.payu.in/...
```

The automation supports browser differences in payment navigation behavior and verifies that the Final7 application successfully hands the participant to PayU.

### Payment Safety

The automation intentionally stops after reaching PayU Hosted Checkout.

It does **not** enter:

- Real card details
- UPI credentials
- Bank credentials
- OTPs
- Real financial information

No real payment is intentionally completed by the automated test.

The objective is to validate the integration boundary:

```text
Final7 Checkout
       ↓
PAY ₹499 WITH PAYU
       ↓
Final7 initiates payment
       ↓
PayU Hosted Checkout reached
       ↓
Automation stops
```

---

# Defect Discovery and Verification

During testing, multiple production defects were identified, documented, fixed, and regression-tested.

---

## BUG-001 — Registration Legal-Version Mismatch

**Severity:** Critical  
**Priority:** High  
**Status:** CLOSED — Fixed and verified

### Problem

Fresh participant registration was blocked because the frontend and backend legal-document identity/version were not synchronized.

Previously observed message:

```text
The legal document version changed. Reload the page and review the current terms.
```

### Impact

A valid fresh participant could complete the registration form but could not successfully proceed with registration.

### Verification After Fix

After the application fix:

- Current legal version and hash are synchronized
- Legal acknowledgements can be accepted
- Fresh registration succeeds
- Participant proceeds to checkout
- Automated registration regression passes

**Result:** Fixed and verified.

---

## BUG-002 — Checkout / Payment Configuration Blocker

**Severity:** Critical  
**Priority:** High  
**Status:** CLOSED — Fixed and verified

### Problem

Paid checkout was blocked because required Organizer, customer-care, grievance, and payment configuration was incomplete.

Previously observed behavior:

```text
Paid checkout is blocked until required Organizer/customer-care/grievance
disclosures are configured and payments are explicitly enabled.
```

### Impact

Participants could not proceed with the expected paid checkout flow.

### Verification After Fix

After the application fix:

- Required compliance configuration is available
- Payments are enabled
- Checkout acknowledgements work
- ₹499 payment action becomes available
- Final7 successfully initiates PayU
- PayU Hosted Checkout can be reached

The previous Razorpay integration has been retired.

Current automation validates the **PayU Hosted Checkout** implementation.

**Result:** Fixed and verified.

---

## BUG-003 — Unauthenticated Dashboard Routing

**Severity:** Medium  
**Priority:** High  
**Status:** CLOSED — Fixed and verified

### Problem

An unauthenticated user could encounter incorrect behavior when attempting to directly access:

```text
/#/dashboard
```

The protected route did not consistently handle the unauthenticated state correctly across the tested browser flow.

A raw backend/application error had also been observed during this scenario:

```text
Edge Function returned a non-2xx status code
```

### Impact

Instead of consistently handling unauthenticated access through the expected authentication flow, the protected dashboard route could remain in an incorrect state.

### Verification After Fix

After the fix:

- Authentication is checked before protected participant access
- Logged-out users cannot remain on the protected dashboard
- Protected participant content is not exposed
- Logout removes participant access
- Direct dashboard access after logout remains protected
- Cross-browser regression passes

**Result:** Fixed and verified.

---

# Cross-Browser Testing

The project is configured to run against:

```text
Chromium
Firefox
WebKit
```

Playwright projects are configured using:

```js
projects: [
    {
        name: 'chromium',
        use: {
            ...devices['Desktop Chrome']
        }
    },

    {
        name: 'firefox',
        use: {
            ...devices['Desktop Firefox']
        }
    },

    {
        name: 'webkit',
        use: {
            ...devices['Desktop Safari']
        }
    }
]
```

Cross-browser testing uncovered browser-specific timing and interaction differences that were not visible during Chromium-only execution.

The final regression result is:

```text
Chromium   PASS
Firefox    PASS
WebKit     PASS

42/42 test executions passed
```

---

# Browser Stability Handling

Production applications can contain animations, custom controls, asynchronous API calls, and external redirects.

The framework therefore includes stability handling such as:

- Explicit Playwright assertions
- Configured assertion timeouts
- Navigation timeouts
- Action timeouts
- Reduced-motion browser configuration
- Cross-browser checkbox handling
- Dynamic URL verification
- Payment gateway navigation detection
- Failure screenshots
- Failure videos
- Playwright traces

The objective is to make tests stable while continuing to validate meaningful application behavior.

---

# Registration Rate-Limit Testing Consideration

The production backend includes registration rate limiting.

During cross-browser regression testing, repeated fresh-user creation initially triggered:

```text
Too many registration attempts. Please try again later.
```

This was identified as an environment/backend constraint rather than a locator failure.

The production registration IP threshold was adjusted to support legitimate cross-browser QA execution while retaining email-level protection.

Unique email generation continues to be used for automated fresh-participant scenarios.

This demonstrates the importance of distinguishing:

```text
Application defect
vs
Automation defect
vs
Test-environment limitation
```

---

# Project Structure

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

# Installation

## 1. Clone Repository

```bash
git clone https://github.com/bhushansatdive7/final7-playwright-automation.git
```

## 2. Open Project

```bash
cd final7-playwright-automation
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Install Playwright Browsers

```bash
npx playwright install
```

---

# Environment Setup

Create a local `.env` file in the project root.

Example:

```env
FINAL7_QA_EMAIL=your_paid_test_email_here
FINAL7_QA_PASSWORD=your_paid_test_password_here
```

The real `.env` file must remain excluded from Git.

Never commit real QA credentials.

---

# Running Tests

## Run Full Cross-Browser Regression

```bash
npx playwright test --workers=1
```

Expected validated result:

```text
42 passed
```

---

## Run Chromium Only

```bash
npx playwright test --project=chromium --workers=1
```

Expected test executions:

```text
14
```

---

## Run Firefox Only

```bash
npx playwright test --project=firefox --workers=1
```

---

## Run WebKit Only

```bash
npx playwright test --project=webkit --workers=1
```

---

## Run One Test File

Example:

```bash
npx playwright test tests/login.spec.js --workers=1
```

---

## Run One Test File in Firefox

```bash
npx playwright test tests/payment.spec.js --project=firefox --workers=1
```

---

## Run in Headed Mode

Example:

```bash
npx playwright test tests/payment.spec.js --project=firefox --workers=1 --headed
```

---

# HTML Report

After test execution, open the Playwright HTML report using:

```bash
npx playwright show-report
```

The framework also retains useful debugging artifacts for failures, including:

- Screenshots
- Videos
- Trace information

These artifacts help identify whether a failure originates from:

- Application behavior
- Browser-specific behavior
- Test automation
- Backend responses
- External integrations

---

# Continuous Integration

GitHub Actions is configured for automated Playwright execution.

Workflow:

```text
.github/workflows/playwright.yml
```

The CI pipeline performs tasks including:

- Repository checkout
- Node.js setup
- Dependency installation
- Playwright browser installation
- QA credential loading through GitHub Secrets
- Automated regression execution
- Playwright HTML report generation
- Test report artifact upload

GitHub Secrets used by the test framework:

```text
FINAL7_QA_EMAIL
FINAL7_QA_PASSWORD
```

Sensitive credentials are not stored directly in the repository.

---

# Playwright Configuration

The framework includes production-oriented timeout and debugging configuration.

Key areas include:

```text
Test timeout
Assertion timeout
Action timeout
Navigation timeout
Reduced motion
Trace capture
Failure screenshots
Failure video
Cross-browser projects
```

These settings improve stability when testing a live production application and external payment gateway.

---

# Automation Practices Demonstrated

This project demonstrates practical Playwright and QA automation concepts including:

- End-to-end testing
- Functional testing
- Positive testing
- Negative testing
- Smoke testing
- Registration testing
- Authentication testing
- Access-control testing
- Session testing
- Checkout testing
- External payment gateway testing
- Cross-browser testing
- Role-based Playwright locators
- Accessible selectors
- Dynamic test-data generation
- Environment-variable handling
- Reusable helper functions
- Async Playwright assertions
- URL validation
- Session validation
- Browser-specific troubleshooting
- External navigation handling
- Git version control
- GitHub Actions CI
- HTML reporting
- Failure screenshots
- Failure videos
- Playwright traces

---

# Locator Strategy

The project primarily uses user-facing and accessibility-based Playwright locators.

Examples include:

```js
page.getByRole('button', {
    name: 'SIGN IN'
});
```

```js
page.getByRole('textbox', {
    name: 'Email'
});
```

```js
page.getByText(
    'Invalid login credentials',
    {
        exact: true
    }
);
```

Using accessible locators makes the tests easier to understand and generally more maintainable than relying heavily on complex CSS or XPath selectors.

---

# Test Data Strategy

Fresh-registration tests use dynamically generated email addresses.

Example:

```js
const testEmail =
    `final7payment${Date.now()}@gmail.com`;
```

Existing paid-participant scenarios use environment-based QA credentials.

This creates two distinct test-data approaches:

```text
Fresh participant
        ↓
Dynamic test data
        ↓
Registration / Checkout / PayU tests
```

and:

```text
Existing paid QA participant
        ↓
Environment credentials
        ↓
Login / Dashboard / Session tests
```

---

# Production Testing Considerations

Some automated tests interact with the live production backend.

Fresh-registration tests can create real test participant records.

Payment tests can also initiate real PayU checkout transactions.

For this reason:

- Full regression is executed sequentially using `--workers=1`
- Dynamic test emails are used
- No real payment is completed
- Real financial credentials are never entered
- PayU testing stops after hosted checkout is reached
- Backend rate limits must be considered
- Test failures are investigated before assertions are weakened

For a larger automation framework, these scenarios should eventually execute against a dedicated staging/test environment with controlled test data and automated cleanup.

---

# Defect-to-Automation Workflow

This project demonstrates more than writing Playwright scripts.

The QA workflow used throughout the project is:

```text
Requirement Understanding
        ↓
Manual Testing
        ↓
Defect Discovery
        ↓
Bug Documentation
        ↓
Application Fix
        ↓
Manual Verification
        ↓
Playwright Regression Automation
        ↓
Cross-Browser Testing
        ↓
Regression Verification
        ↓
Git / GitHub
        ↓
Continuous Integration
```

Important defects were converted into regression scenarios so that previously fixed behavior can continue to be verified.

---

# Key Project Achievements

- Built **14 Playwright automated test cases**
- Achieved **42/42 cross-browser test executions passing**
- Validated Chromium, Firefox, and WebKit
- Automated registration and authentication
- Automated protected-route testing
- Automated paid-participant dashboard scenarios
- Automated checkout validation
- Automated PayU Hosted Checkout handoff
- Identified and verified multiple production defects
- Added regression coverage for fixed defects
- Implemented dynamic test-data generation
- Used environment variables for sensitive credentials
- Added GitHub Actions CI
- Implemented Playwright debugging artifacts
- Stabilized browser-specific automation behavior
- Tested against a live production application

---

# Future Framework Improvements

The next phase of the project will focus on framework architecture and maintainability.

Planned improvements include:

- Page Object Model (POM)
- Custom Playwright fixtures
- Centralized test-data utilities
- Authentication fixtures
- Reusable registration utilities
- API-based test setup
- API testing with Playwright
- Test tags
- Smoke/regression tagging strategy
- Dedicated staging environment
- Automated test-data cleanup
- Additional challenge-flow automation
- CI improvements
- Environment-based execution
- Reduced duplication between test files

Planned structure:

```text
final7-playwright-automation/
│
├── pages/
│   ├── LoginPage.js
│   ├── RegisterPage.js
│   ├── CheckoutPage.js
│   └── DashboardPage.js
│
├── tests/
│
├── utils/
│   └── testData.js
│
├── playwright.config.js
├── package.json
└── README.md
```

---

# Portfolio Value

This project is intended to demonstrate practical QA automation ability rather than only basic Playwright syntax.

It demonstrates experience with:

```text
Manual Testing
+
Defect Analysis
+
Regression Testing
+
JavaScript
+
Playwright
+
Cross-Browser Automation
+
API/Backend Awareness
+
Payment Integration Testing
+
Git
+
GitHub Actions
+
CI/CD Awareness
```

The project includes examples of real application behavior being investigated, defects being identified and verified, and critical functionality being protected through automated regression tests.

---

# Author

**Bhushan Satdive**

GitHub username:

```text
bhushansatdive7
```

---

# Project Purpose

Final7 Playwright Automation was created as a hands-on QA automation portfolio project to demonstrate practical experience with:

**Playwright, JavaScript, functional testing, end-to-end automation, defect verification, regression testing, cross-browser testing, payment-flow testing, Git, and GitHub Actions CI.**

### Final Validated Regression Result

```text
14 automated test cases
3 browser engines
42 total test executions

Chromium: PASS
Firefox:  PASS
WebKit:   PASS

Final Result: 42/42 PASSED
```