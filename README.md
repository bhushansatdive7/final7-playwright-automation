# Final7 Playwright Automation

End-to-end test automation project for **THE FINAL 7** web application using **Playwright** and **JavaScript**.

This project automates critical user journeys including registration, authentication, access control, participant dashboard behavior, checkout protection, and payment-related flows.

---

## Tech Stack

- Playwright
- JavaScript
- Node.js
- Git
- GitHub
- GitHub Actions
- Chromium

---

## Test Coverage

The automation suite currently covers:

### Smoke & Landing Page

- Homepage availability
- Page title validation
- Main CTA navigation
- Registration page navigation

### Registration

- New user registration flow
- Required full-name validation
- Terms and acknowledgement handling

### Authentication

- Successful user login
- Invalid credential validation
- Logout functionality
- Session protection

### Access Control

- Prevent unauthenticated access to participant dashboard
- Verify protected dashboard content is not exposed

### Participant Dashboard

- Paid participant dashboard access
- Waiting-for-event status
- Session persistence after refresh
- Logout session removal
- Prevent challenge access before event window
- Prevent duplicate checkout/payment access

### Checkout & Payment

- Checkout page validation
- Payment acceptance controls
- Razorpay gateway launch flow

Some payment and registration tests are currently marked as `fixme` while corresponding production configuration / application blockers are being resolved.

---

## Current Test Status

Current Chromium suite:

```text
14 tests
11 passed
3 skipped
0 failed