/**
 * Browser API utilities for safe SSR/SSG usage
 * Use these helpers to safely access browser APIs that don't exist during server-side rendering
 */

/**
 * Check if code is running in the browser
 */
export const isBrowser = (): boolean => {
    return typeof window !== 'undefined';
};

/**
 * Check if code is running on the server
 */
export const isServer = (): boolean => {
    return typeof window === 'undefined';
};

/**
 * Safely get window.location
 * Returns null during SSR
 */
export const getLocation = (): Location | null => {
    return isBrowser() ? window.location : null;
};

/**
 * Safely get localStorage
 * Returns null during SSR
 */
export const getLocalStorage = (): Storage | null => {
    return isBrowser() ? window.localStorage : null;
};

/**
 * Safely get sessionStorage
 * Returns null during SSR
 */
export const getSessionStorage = (): Storage | null => {
    return isBrowser() ? window.sessionStorage : null;
};

/**
 * Safely access navigator
 * Returns null during SSR
 */
export const getNavigator = (): Navigator | null => {
    return isBrowser() ? window.navigator : null;
};

/**
 * Execute a function only in the browser
 * @param fn Function to execute
 * @param fallback Optional fallback value for SSR
 */
export const browserOnly = <T>(fn: () => T, fallback?: T): T | undefined => {
    if (isBrowser()) {
        return fn();
    }
    return fallback;
};

/**
 * Execute a function only on the server
 * @param fn Function to execute
 * @param fallback Optional fallback value for browser
 */
export const serverOnly = <T>(fn: () => T, fallback?: T): T | undefined => {
    if (isServer()) {
        return fn();
    }
    return fallback;
};
