import { BookingState, BookingContext } from './booking.state';

export const BookingFlow = {
    initialState: "IDLE" as BookingState,

    next(state: BookingState, event: string, context?: BookingContext): BookingState {
        switch (state) {
            case "IDLE":
                if (event === "START") return "DRAFT";
                break;

            case "DRAFT":
                if (event === "SUBMIT_ESTIMATE") return "ESTIMATING";
                if (event === "SUBMIT_LIVE") return "SEARCHING"; // Skip estimate for live
                break;

            case "ESTIMATING":
                if (event === "ACCEPT_ESTIMATE") return "REQUESTING";
                if (event === "CANCEL") return "IDLE";
                break;

            case "REQUESTING":
                if (event === "SUCCESS") return "SEARCHING"; // Wait for provider
                if (event === "FAIL") return "FAILED";
                break;

            case "SEARCHING":
                if (event === "PROVIDER_FOUND") return "CONFIRMED";
                if (event === "TIMEOUT") return "FAILED";
                if (event === "CANCEL") return "CANCELLED";
                break;

            case "CONFIRMED":
                if (event === "PROVIDER_EN_ROUTE") return "EN_ROUTE";
                if (event === "CANCEL") return "CANCELLED";
                break;

            case "EN_ROUTE":
                if (event === "START_JOB") return "IN_PROGRESS";
                if (event === "CANCEL") return "CANCELLED";
                break;

            case "IN_PROGRESS":
                if (event === "COMPLETE") return "COMPLETED";
                break;
        }
        return state;
    }
};
