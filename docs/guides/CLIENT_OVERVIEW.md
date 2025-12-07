# Production Ready Document for Further Development

## 1. Project Overview

This document outlines the architecture, components, and services of the thelokals.com web application. The application is designed to connect users with local service professionals for various tasks. It provides a platform for searching, booking, and managing services.

**Core functionalities:**

*   **User Authentication:** Secure sign-up and sign-in for users.
*   **Service Professional Discovery:** Users can browse and search for professionals by category or specific needs.
*   **Geolocation:** The application utilizes geolocation to display nearby professionals.
*   **Booking System:** A seamless booking process for requesting services.
*   **Dashboards:** Separate dashboards for users and professionals to manage their activities.
*   **Payment Processing:** A mock payment system for handling transactions.

## 2. Technical Stack

*   **Frontend:** React, TypeScript, Vite
*   **Styling:** Tailwind CSS
*   **Backend-as-a-Service (BaaS):** Supabase (for database and authentication)
*   **Artificial Intelligence:** Google Gemini (for natural language search query interpretation)

## 3. Project Structure

The project follows a component-based architecture, with a clear separation of concerns.

```
/
├── .idx/
│   └── dev.nix
├── components/
│   ├── AuthModal.tsx
│   ├── BookingModal.tsx
│   ├── Header.tsx
│   ├── PaymentModal.tsx
│   ├── ReviewModal.tsx
│   ├── UserDashboard.tsx
│   ├── WorkerCard.tsx
│   └── WorkerDashboard.tsx
├── contexts/
│   └── AuthContext.tsx
├── services/
│   ├── bookingService.ts
│   ├── geminiService.ts
│   ├── supabase.ts
│   └── workerService.ts
├── App.tsx
├── README.md
├── constants.ts
├── index.html
├── index.tsx
├── metadata.json
├── package.json
├── tsconfig.json
├── types.ts
└── vite.config.ts
```

## 4. Component Breakdown

### 4.1. `App.tsx`

The main component that serves as the entry point of the application. It manages the overall layout, view state, and data flow.

### 4.2. `components/`

*   **`AuthModal.tsx`:** Handles user registration and login.
*   **`BookingModal.tsx`:** Facilitates the process of booking a service with a professional.
*   **`Header.tsx`:** The main navigation bar, providing access to different sections of the app.
*   **`PaymentModal.tsx`:** A mock modal for processing payments.
*   **`ReviewModal.tsx`:**  Allows users to submit reviews for completed services.
*   **`UserDashboard.tsx`:**  Displays booking history and status for the logged-in user.
*   **`WorkerCard.tsx`:**  A card component to display summary information of a service professional.
*   **`WorkerDashboard.tsx`:**  A dashboard for professionals to view and manage their bookings.

### 4.3. `contexts/`

*   **`AuthContext.tsx`:** Manages the application's authentication state, providing user information throughout the component tree.

### 4.4. `services/`

*   **`bookingService.ts`:**  Contains functions for creating and managing bookings.
*   **`geminiService.ts`:**  Integrates with the Gemini API to interpret natural language search queries.
*   **`supabase.ts`:**  Initializes the Supabase client.
*   **`workerService.ts`:**  Fetches data related to service professionals.

## 5. Database Schema

The database is managed using Supabase. The conceptual schema is as follows:

### `workers` table

| Column      | Type        | Description                               |
| :---------- | :---------- | :---------------------------------------- |
| `id`        | `uuid`      | Primary Key                               |
| `name`      | `text`      | Name of the professional                  |
| `category`  | `text`      | Category of service (e.g., Plumber, Cleaner) |
| `description`| `text`     | A brief description of the professional's services |
| `location`  | `point`     | Geographic coordinates of the professional |
| `price`     | `float`     | The rate for the service                  |
| `priceUnit` | `text`      | The unit of the price (e.g., "hour", "day") |
| `rating`    | `float`     | The average rating of the professional    |
| `status`    | `text`      | Availability status (e.g., "AVAILABLE", "BUSY") |
| `imageUrl`  | `text`      | URL of the professional's profile image   |
| `expertise` | `array`     | A list of the professional's skills       |

### `bookings` table

| Column        | Type        | Description                               |
| :------------ | :---------- | :---------------------------------------- |
| `id`          | `uuid`      | Primary Key                               |
| `worker_id`   | `uuid`      | Foreign Key to the `workers` table        |
| `user_id`     | `uuid`      | Foreign Key to the `auth.users` table     |
| `note`        | `text`      | User's note or description of the task    |
| `status`      | `text`      | Status of the booking (e.g., "PENDING", "CONFIRMED") |
| `total_price` | `float`     | The total price of the booking            |
| `created_at`  | `timestamp` | The timestamp of when the booking was created |

## 6. Future Development Roadmap

### 6.1. Immediate Next Steps

*   **Real-time functionality:** Implement real-time updates for booking status and professional location using Supabase Subscriptions.
*   **Payment Gateway Integration:** Replace the mock payment modal with a real payment gateway like Stripe.
*   **User Reviews and Ratings:** Fully implement the review and rating system.

### 6.2. Long-term Enhancements

*   **In-app Chat:** Add a messaging feature for direct communication between users and professionals.
*   **Push Notifications:** Implement push notifications for important updates.
*   **Admin Panel:** Develop a comprehensive admin panel for managing the platform.
*   **Advanced Search and Filtering:** Introduce more granular search filters, such as availability, specific skills, and service radius.
*   **Multi-language Support:** Add internationalization to support multiple languages.
