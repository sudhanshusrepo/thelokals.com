import { AuthState, AuthContext } from './auth.state';

export const AuthFlow = {
    initialState: "IDLE" as AuthState,

    next(state: AuthState, event: string, context?: AuthContext): AuthState {
        switch (state) {
            case "IDLE":
                if (event === "INIT") return "ANONYMOUS";
                if (event === "SESSION_FOUND") return "AUTHENTICATED";
                break;

            case "ANONYMOUS":
                if (event === "SEND_OTP") return "OTP_SENT";
                break;

            case "OTP_SENT":
                if (event === "VERIFY") return "VERIFYING";
                if (event === "RETRY") return "ANONYMOUS";
                break;

            case "VERIFYING":
                if (event === "SUCCESS") return "AUTHENTICATED";
                if (event === "FAIL") return "ERROR";
                break;

            case "AUTHENTICATED":
                if (event === "PROFILE_CHECK" && !context?.profile) return "PROFILE_INCOMPLETE";
                if (event === "PROFILE_CHECK" && context?.profile) return "READY";
                if (event === "LOGOUT") return "ANONYMOUS";
                break;

            case "PROFILE_INCOMPLETE":
                if (event === "PROFILE_SAVED") return "READY";
                if (event === "LOGOUT") return "ANONYMOUS";
                break;

            case "ERROR":
                if (event === "RESET") return "ANONYMOUS";
                break;
        }
        return state;
    }
};
