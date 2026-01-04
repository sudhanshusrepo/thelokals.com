# End-to-End Booking Flow Test Plan (Gurugram)

**Objective**: Ensure the end-to-end booking flow (Admin → Client → Provider) works reliably for Gurugram with three enabled services across all three web apps.
**Frequency**: Run this regression test every time a new build is deployed.

## Scope
*   **In Scope**: Admin service enablement, Client discovery & booking, Provider acceptance & map navigation.
*   **Out of Scope**: Payments, refunds, internal notifications (SMS/Email) beyond UI verification.

## Core User Stories
1.  **Admin**: As a super admin, I want to enable services for a city so that clients can book only approved offerings.
2.  **Client**: As a client, I want to see and book only active services in my city so that I do not encounter dead listings.
3.  **Provider**: As a provider, I want to receive live booking requests and view client location on a map so that I can navigate to the service address.

---

## Iteration 1 – Admin App Scenarios

### Scenario 1.1: Admin Login & Context
*   **Goal**: Verify super admin access and city context switching.
*   **Steps**:
    1.  Log in with valid Super Admin credentials.
    2.  Land on Admin Dashboard.
    3.  Select **Gurugram** from the location/city context selector.
*   **Acceptance Criteria**:
    *   Dashboard reflects Gurugram data.
    *   Service management screens filter by Gurugram.

### Scenario 1.2: Enable Services for Gurugram
*   **Precondition**: Services exist in catalog but are "Disabled" for Gurugram.
*   **Steps**:
    1.  Navigate to **Services**.
    2.  Filter by **Gurugram**.
    3.  Randomly select 3 services (e.g., *AC Repair, Home Cleaning, Plumbing*).
    4.  Set status to **Enabled/Active** for these 3 services.
    5.  Save changes.
*   **Acceptance Criteria**:
    *   Selected services show as "Active" in the Admin list.
    *   Last-updated metadata is refreshed.
    *   Audit log records the status change.

---

## Iteration 2 – Client App Scenarios

### Scenario 2.1: Service Discovery
*   **Precondition**: Three services enabled for Gurugram (from Scenario 1.2).
*   **Steps**:
    1.  Open **Web Client** app.
    2.  Set location to **Gurugram** (manual selection or geolocation).
    3.  Browse the Home/Services list.
*   **Acceptance Criteria**:
    *   The 3 enabled services appear in the listing.
    *   They are clickable and bookable.
    *   Disabled services or services from other cities do NOT appear.

### Scenario 2.2: Create Live Booking
*   **Precondition**: Test Client is logged in.
*   **Steps**:
    1.  Select one of the enabled Gurugram services.
    2.  Choose a slot/time (or "ASAP").
    3.  Confirm address is in **Gurugram** (enter valid Gurugram address/pin code).
    4.  Submit Booking.
*   **Acceptance Criteria**:
    *   Booking ID is generated.
    *   Status is **Pending** or **Assigned**.
    *   Client sees Confirmation Screen.
    *   Booking is tied to Gurugram and the selected Service.

### Scenario 2.3: AI Chat Booking
*   **Goal**: Verify booking via the new AI Chat Widget.
*   **Steps**:
    1.  Click the Floating Action Button (FAB) to open Chat.
    2.  Type "I need a plumber".
    3.  Verify AI responds with a "Booking Proposal" card.
    4.  Click **"Book Now"** on the proposal.
*   **Acceptance Criteria**:
    *   User is navigated to the Booking Confirmation flow for "Plumbing".
    *   (Optional) Context (Service Name) is pre-filled.

---

## Iteration 3 – Provider App Scenarios

### Scenario 3.1: Booking Receipt
*   **Precondition**: Test Provider is logged in, approved, and configured for **Gurugram** + the relevant **Service Category**.
*   **Steps**:
    1.  Log in to **Web Provider** app.
    2.  Navigate to **New Requests / Live Bookings**.
    3.  Look for the booking created in Scenario 2.2.
*   **Acceptance Criteria**:
    *   Booking appears in the list within SLA (e.g., <10 seconds).
    *   Service details matches Scenario 2.2.
    *   Location is confirmed as Gurugram.

### Scenario 3.2: Booking Details & Navigation
*   **Steps**:
    1.  Tap/Click on the booking to open **Details**.
    2.  Verify Client Name, Phone, Address, Pin Code.
    3.  Click **Navigate** / Map Icon.
*   **Acceptance Criteria**:
    *   External Map (Google Maps) or In-App Map opens.
    *   Pin is correctly dropped at the client's Gurugram coordinates.
    *   Route is calculated validly (no "Zero location" errors).

### Scenario 3.3: Job Lifecycle & Earnings
*   **Precondition**: Job is "Accepted" (Status: CONFIRMED).
*   **Steps**:
    1.  Open Job Details.
    2.  Click **"Start Job"**. Verify Status changes to `IN_PROGRESS`.
    3.  (Simulate work)... Click **"Complete Job"**. Verify Status changes to `COMPLETED`.
    4.  Go to **Dashboard**.
*   **Acceptance Criteria**:
    *   "Jobs Completed" count increments.
    *   "Total Earnings" increases by the job amount (provider share).

---

## Data Strategy
*   **Test Users** (Credentials stored in Secure Vault):
    *   `super_admin_test`
    *   `client_gurugram_test`
    *   `provider_gurugram_test`
*   **Test Data**:
    *   **Default Address**: Use a known valid Gurugram address (e.g., *Cyber Hub, DLF Phase 2, Gurugram, Haryana 122002*) to ensure map navigation consistency.
