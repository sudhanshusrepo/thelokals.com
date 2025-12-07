# Repository Summary & User Guide

## 1. Introduction
The Lokals is a comprehensive local services platform connecting users with service professionals. The ecosystem consists of three main applications: **Client App**, **Provider App**, and **Admin Portal**, all powered by a Supabase backend.

## 2. Client Application (`packages/client`)
**Target User:** Customers looking for local services (maids, cooks, electricians, etc.).

### User Lifecycle
1.  **Sign Up / Sign In**:
    -   **Methods**: Phone Number (OTP via Firebase), Google OAuth.
    -   **Flow**: Users authenticating via phone are checked against the `profiles` table. New users are automatically created.
2.  **Discovery**:
    -   **Home Page**: Search bar and popular categories.
    -   **AI Search**: Natural language search powered by Gemini AI ("I need a plumber for a leaky tap").
    -   **Category Browse**: Dedicated pages for specific services (e.g., Home Cleaning).
3.  **Booking**:
    -   **Manual Booking**: Select service -> Choose specifics -> Confirm.
    -   **AI Booking**: AI interprets requirements -> Generates checklist -> Estimates cost -> Creates booking.
4.  **Management**:
    -   **Dashboard**: View active, upcoming, and past bookings.
    -   **Profile**: Manage personal details and saved addresses.
5.  **Account Deletion**:
    -   Users can request account deletion via the Profile section (Safety requirement).

### Key Features
-   **Live Location**: Uses Geolocation to find nearby providers.
-   **Real-time Updates**: Booking status updates via Supabase Realtime.
-   **Theme**: Support for Dark/Light mode.

---

## 3. Provider Application (`packages/provider`)
**Target User:** Service professionals (workers) looking for jobs.

### User Lifecycle
1.  **Onboarding**:
    -   **Registration Wizard**: Multi-step process collecting Personal Info, Service Category, Experience, and Documents (ID proof).
    -   **Verification**: Account set to `pending` until Admin/System verification (simulated).
2.  **Engagement**:
    -   **Job Requests**: Receive real-time booking requests from nearby clients.
    -   **Acceptance**: Accept or Reject jobs based on timing/price.
3.  **Service Delivery**:
    -   **Job Management**: View job details, navigate to location, mark as complete.
    -   **Payments**: Track earnings and payouts.
4.  **Profile**:
    -   Manage service radius, availability, and documents.
5.  **Account Deletion**:
    -   *Not currently implemented in self-serve UI. Requires Admin request.*

### Key Features
-   **Radius Control**: Providers set how far they are willing to travel.
-   **Instant Notifications**: Alerts for new jobs.
-   **Document Upload**: Secure upload for verification documents.

---

## 4. Admin Portal (`packages/admin`)
**Target User:** Platform Administrators.

### Features
-   **Dashboard**: High-level metrics (Total Users, Active Providers, Revenue).
-   **User Management**: View and manage Client and Provider accounts.
-   **Location Manager**: Manage service areas and geofencing.
-   **Analytics**: deeply analyze platform performance.
-   **Audit Logs**: security and action logs.

---

## 5. Technology Stack
-   **Frontend**: React, TypeScript, Vite, Tailwind CSS.
-   **Monorepo**: Turborepo for workspace management.
-   **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Realtime, Storage).
-   **AI**: Google Gemini Pro for intent recognition and pricing estimation.
-   **Maps**: Leaflet / React-Leaflet for mapping.
-   **Auth**: Firebase Auth (Phone) + Supabase Auth (OAuth).
