/**
 * Mock Analytics Service
 * In production, this would wrap Firebase Analytics / Crashlytics
 */

export const Analytics = {
    /**
     * Log a standard event
     */
    logEvent: (event: string, params?: Record<string, any>) => {
        if (__DEV__) {
            console.log(`[Analytics 📊] ${event}`, params || '');
        }
        // In prod: firebase.analytics().logEvent(event, params);
    },

    /**
     * Log a non-fatal error to Crashlytics
     */
    logError: (error: Error | string) => {
        if (__DEV__) {
            console.error(`[Crashlytics 💥]`, error);
        }
        // In prod: firebase.crashlytics().recordError(error);
    },

    /**
     * Set User ID for session tracking
     */
    setUserId: (userId: string) => {
        if (__DEV__) {
            console.log(`[Analytics 👤] Set User ID: ${userId}`);
        }
        // In prod: firebase.analytics().setUserId(userId);
    }
};
