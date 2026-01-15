import { BookingState, BookingContext } from './booking.state';

export const BookingFlow = {
    initialState: "IDLE" as BookingState,

    next(state: BookingState, event: string, context?: BookingContext): BookingState {
        switch (state) {
            case "IDLE":
                if (event === "START") return "DRAFT";
                break;

            case "DRAFT":
                if (event === "SUBMIT_LIVE") return "SEARCHING";
                if (event === "CANCEL") return "IDLE";
                break;

            case "SEARCHING":
                // Pre-Booking / Map Discovery
                if (event === "CREATE_BOOKING") return "BOOKING_CREATED";
                if (event === "CANCEL") return "IDLE";
                if (event === "SUBMIT_LIVE") return "BOOKING_CREATED"; // Handle duplicate/direct transition
                break;

            case "BOOKING_CREATED":
                // System confirms record created
                if (event === "START_MATCHING") return "PROVIDER_MATCHING";
                if (event === "CANCEL") return "CLOSED";
                break;

            case "PROVIDER_MATCHING":
                // Broadcasting to providers
                if (event === "PROVIDER_ACCEPTED") return "PROVIDER_ACCEPTED";
                if (event === "TIMEOUT") return "CLOSED"; // Or retry
                if (event === "CANCEL") return "CLOSED";
                break;

            case "PROVIDER_ACCEPTED":
                // Provider assigned
                if (event === "PROVIDER_EN_ROUTE") return "PROVIDER_EN_ROUTE";
                if (event === "CANCEL") return "CLOSED"; // With penalty maybe
                break;

            case "PROVIDER_EN_ROUTE":
                if (event === "START_JOB") return "SERVICE_IN_PROGRESS";
                if (event === "CANCEL") return "CLOSED";
                break;

            case "SERVICE_IN_PROGRESS":
                if (event === "COMPLETE_JOB") return "SERVICE_COMPLETED";
                break;

            case "SERVICE_COMPLETED":
                // Work done, waiting for payment gen
                if (event === "GENERATE_INVOICE") return "PAYMENT_PENDING";
                // Auto transition often
                if (event === "SKIP_INVOICE") return "PAYMENT_PENDING";
                break;

            case "PAYMENT_PENDING":
                if (event === "PAYMENT_SUCCESS") return "PAYMENT_SUCCESS";
                break;

            case "PAYMENT_SUCCESS":
                // Feedback loop
                if (event === "CLOSE") return "CLOSED";
                break;

            case "CLOSED":
                // Final terminal state
                break;
        }
        return state;
    }
};
