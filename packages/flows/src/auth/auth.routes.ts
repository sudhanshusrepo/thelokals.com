import { AuthState } from './auth.state';

export const authRouteMap = {
    web: {
        ANONYMOUS: "/login",
        OTP_SENT: "/login/verify",
        PROFILE_INCOMPLETE: "/profile/setup",
        READY: "/", // Home
        ERROR: "/login?error=true"
    } as Record<AuthState, string>,

    mobile: {
        ANONYMOUS: "LoginScreen",
        OTP_SENT: "VerifyOtpScreen",
        PROFILE_INCOMPLETE: "ProfileSetupScreen",
        READY: "HomeScreen",
        ERROR: "LoginScreen"
    } as Record<AuthState, string>
};
