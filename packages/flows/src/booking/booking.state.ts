export type BookingState =
    | "IDLE"
    | "DRAFT"            // UI: Input details
    | "ESTIMATING"       // UI: Legacy/Scheduled
    | "REQUESTING"       // UI: Creating booking record
    | "SEARCHING"        // UI: Pulse / Finding Providers
    | "BOOKING_CREATED"  // DB: Record exists
    | "PROVIDER_MATCHING"// DB/Sys: Broadcasting
    | "PROVIDER_ACCEPTED"// DB: Assigned
    | "PROVIDER_EN_ROUTE"// DB: On way
    | "SERVICE_IN_PROGRESS" // DB: Working
    | "SERVICE_COMPLETED"   // DB: Done
    | "PAYMENT_PENDING"
    | "PAYMENT_SUCCESS"
    | "CLOSED"
    // Compat / Legacy aliases (to be phased out or mapped)
    | "CONFIRMED"        // -> PROVIDER_ACCEPTED
    | "EN_ROUTE"         // -> PROVIDER_EN_ROUTE
    | "IN_PROGRESS"      // -> SERVICE_IN_PROGRESS
    | "COMPLETED"        // -> SERVICE_COMPLETED
    | "CANCELLED"
    | "FAILED";

import { ServiceCategory, ServiceItem, Coordinates, Provider } from '@thelocals/platform-core';

export interface BookingContext {
    // ID State
    bookingId?: string;

    // Selection (Screen 1)
    serviceCategory?: ServiceCategory;
    selectedOption?: ServiceItem;

    // Configuration
    location?: {
        lat: number;
        lng: number;
        address: string;
    };
    schedule?: Date | null; // null implies Instant Booking

    // Live State (Screen 2)
    provider?: Provider;
    eta?: number; // minutes

    // Payment (Screen 3)
    paymentMethod?: 'CASH' | 'UPI' | 'ONLINE';

    // Metadata
    serviceName?: string; // Legacy/Fallback
    price?: number;       // Legacy/Fallback
    image?: string;       // Legacy/Fallback

    error?: string;
}
