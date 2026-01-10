export type BookingState =
    | "IDLE"
    | "DRAFT"
    | "ESTIMATING"
    | "REQUESTING"
    | "SEARCHING" // Live request broadcasting
    | "CONFIRMED"
    | "EN_ROUTE"
    | "IN_PROGRESS"
    | "COMPLETED"
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
