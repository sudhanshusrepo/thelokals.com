export type AuthState =
    | "IDLE"
    | "ANONYMOUS"
    | "OTP_SENT"
    | "VERIFYING"
    | "AUTHENTICATED"
    | "PROFILE_INCOMPLETE"
    | "READY"
    | "ERROR";

export interface AuthContext {
    user?: any; // Supabase User
    profile?: any; // App Profile
    phone?: string;
    error?: string;
}
