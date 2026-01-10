import { BookingState } from './booking.state';

export const bookingRouteMap = {
    web: {
        IDLE: "/",
        DRAFT: "/book/service",
        ESTIMATING: "/book/estimate",
        SEARCHING: "/live-request", // Suffix with ID dynamically
        CONFIRMED: "/live-request",
        EN_ROUTE: "/live-request",
        IN_PROGRESS: "/live-request",
        COMPLETED: "/booking/success",
        CANCELLED: "/booking/cancelled",
        FAILED: "/booking/error"
    } as Partial<Record<BookingState, string>>,

    mobile: {
        IDLE: "HomeScreen",
        DRAFT: "BookingWizardScreen",
        ESTIMATING: "EstimateScreen",
        SEARCHING: "LiveRequestScreen",
        CONFIRMED: "LiveRequestScreen",
        EN_ROUTE: "LiveRequestScreen",
        IN_PROGRESS: "LiveRequestScreen",
        COMPLETED: "PaymentSuccessScreen",
        CANCELLED: "HomeScreen",
        FAILED: "ErrorScreen"
    } as Partial<Record<BookingState, string>>
};
