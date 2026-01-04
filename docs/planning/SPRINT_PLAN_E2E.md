# E2E Booking Flow Sprint Plan

**Objective**: Deliver a fully functional end-to-end booking flow for Gurugram (Admin -> Client -> Provider) with a focus on "Best Practices" and "No Prototyping".

## Sprint 1: Foundation & Service Availability (The "Admin/Client" Gap)
**Goal**: Admin can enable services for a specific city, and Client sees ONLY those services.

*   **1.1 Data Model Update (Backend)**
    *   Create `service_locations` table (mapping `service_id` + `city` + `is_active`).
    *   Update `adminService` to manage availability.
*   **1.2 Admin UI (Service Management)**
    *   Add "Location Context" selector in Admin (Global vs Specific City).
    *   Allow toggling "Active" status per city.
*   **1.3 Client UI (Discovery)**
    *   Implement "Location Context" (User can select "Gurugram").
    *   Update Service Listing to filter based on `service_locations`.

## Sprint 2: Provider Core & Intake (The "Provider" Gap - Part 1)
**Goal**: Provider receives live requests and accepts them.

*   **2.1 Booking Details View**
    *   Create dedicated `/jobs/[id]` page or Modal.
    *   Display comprehensive info: Client Name, Address, Service Type, Price.
*   **2.2 Acceptance Logic**
    *   Verify `acceptBooking` transaction safety.
    *   Update UI state instantly upon acceptance.

## Sprint 3: Navigation & Fulfillment (The "Provider" Gap - Part 2)
**Goal**: Provider navigates to the client and completes the job.

*   **3.1 Map Integration**
    *   Values: Parse `address_coordinates` (lat, lng).
    *   Action: "Navigate" button linking to `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}`.
*   **3.2 Job Completion Flow**
    *   "Start Job" and "Complete Job" actions.
    *   Status updates (`IN_PROGRESS` -> `COMPLETED`).

---
**Testing Strategy**:
- After each Sprint, run the relevant "Iteration" from `E2E_SCENARIO_GURUGRAM_BOOKING.md`.
