# Client Application Documentation

## 1. Project Overview

The client application for thelokals.com is a web application built with React and TypeScript. It allows users to find and book local service professionals. The application uses Supabase for the backend, including authentication and database services, and leverages the Google Gemini API for natural language search query interpretation.

**Core Functionalities:**

*   **User Authentication:** Secure sign-up and sign-in for users.
*   **Service Professional Discovery:** Users can browse and search for professionals by category or specific needs.
*   **Geolocation:** The application utilizes geolocation to display nearby professionals.
*   **Booking System:** A seamless booking process for requesting services.
*   **Dashboards:** Separate dashboards for users to manage their activities.

## 2. Technical Stack

*   **Frontend:** React, TypeScript, Vite
*   **Styling:** Tailwind CSS
*   **Backend-as-a-Service (BaaS):** Supabase (for database and authentication)
*   **Artificial Intelligence:** Google Gemini (for natural language search query interpretation)

## 3. Project Structure

The project follows a component-based architecture, with a clear separation of concerns.

```
/packages/client
├── components/
│   ├── AuthModal.tsx
│   ├── BookingModal.tsx
│   ├── Header.tsx
│   ├── NoData.tsx
│   ├── NotFound.tsx
│   ├── PaymentModal.tsx
│   ├── Profile.tsx
│   ├── ReviewModal.tsx
│   ├── Skeleton.tsx
│   ├── StructuredData.tsx
│   ├── Support.tsx
│   ├── TermsAndConditions.tsx
│   ├── UserDashboard.tsx
│   └── WorkerCard.tsx
├── contexts/
│   └── AuthContext.tsx
├── public/
│   ├── robots.txt
│   └── sitemap.xml
├── services/
│   ├── bookingService.ts
│   ├── customerService.ts
│   ├── databaseService.ts
│   ├── geminiService.ts
│   ├── supabase.ts
│   └── workerService.ts
├── App.tsx
├── constants.ts
├── index.css
├── index.html
├── index.tsx
├── metadata.json
├── package.json
├── postcss.config.cjs
├── tailwind.config.cjs
├── tsconfig.json
└── types.ts
```

## 4. Component Breakdown

### 4.1. `App.tsx`

The main component that serves as the entry point of the application. It manages the overall layout, view state, and data flow. It also handles routing for the application.

### 4.2. `components/`

This directory contains all the reusable React components used in the application.

*   **`AuthModal.tsx`:** Handles user registration and login.
*   **`BookingModal.tsx`:** Facilitates the process of booking a service with a professional.
*   **`Header.tsx`:** The main navigation bar, providing access to different sections of the app.
*   **`NoData.tsx`:** A component to display when there is no data to show.
*   **`NotFound.tsx`:** A component to display when a page is not found.
*   **`PaymentModal.tsx`:** A mock modal for processing payments.
*   **`Profile.tsx`:**  Allows users to view and edit their profile.
*   **`ReviewModal.tsx`:**  Allows users to submit reviews for completed services.
*   **`Skeleton.tsx`:**  Provides loading skeletons for a better user experience.
*   **`StructuredData.tsx`:**  Adds structured data to the application for SEO purposes.
*   **`Support.tsx`:**  A component for users to get support.
*   **`TermsAndConditions.tsx`:**  Displays the terms and conditions of the application.
*   **`UserDashboard.tsx`:**  Displays booking history and status for the logged-in user.
*   **`WorkerCard.tsx`:**  A card component to display summary information of a service professional.

### 4.3. `contexts/`

This directory contains all the React contexts used in the application.

*   **`AuthContext.tsx`:** Manages the application's authentication state, providing user information throughout the component tree.

### 4.4. `services/`

This directory contains all the services used in the application.

*   **`bookingService.ts`:**  Contains functions for creating and managing bookings.
*   **`customerService.ts`:** Contains functions for managing customer data.
*   **`databaseService.ts`:** Contains functions for interacting with the Supabase database.
*   **`geminiService.ts`:**  Integrates with the Gemini API to interpret natural language search queries.
*   **`supabase.ts`:**  Initializes the Supabase client.
*   **`workerService.ts`:**  Fetches data related to service professionals.

### 4.5. `constants.ts`

This file contains all the constants used in the application, such as category icons, service groups, and default location.

## 5. Getting Started

To run the client application, you need to have Node.js and npm installed.

1.  Install the dependencies:
    ```bash
        npm install
            ```
            2.  Start the development server:
                ```bash
                    npm run dev
                        ```

                        This will start the application on `http://localhost:5173`.
                        