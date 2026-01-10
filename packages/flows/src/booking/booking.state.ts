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

export interface BookingContext {
    bookingId?: string;
    serviceCategory?: string;
    serviceName?: string;
    price?: number;
    image?: string;
    error?: string;
}
