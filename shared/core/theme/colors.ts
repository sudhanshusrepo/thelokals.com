/**
 * Theme Color Definitions
 * Defines color palettes for client and provider applications
 */

export const colors = {
    client: {
        // Teal/Green theme for customer-facing app
        primary: {
            50: '#f0fdfa',
            100: '#ccfbf1',
            200: '#99f6e4',
            300: '#5eead4',
            400: '#2dd4bf',
            500: '#14b8a6', // Main teal
            600: '#0d9488',
            700: '#0f766e',
            800: '#115e59',
            900: '#134e4a',
        },
        background: {
            light: '#f0fdf4', // Light green background
            DEFAULT: '#ffffff',
            dark: '#0f172a',
        },
        text: {
            primary: '#0f172a',
            secondary: '#64748b',
            light: '#94a3b8',
        },
    },
    provider: {
        // Blue theme for provider-facing app
        primary: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6', // Main blue
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
        },
        background: {
            light: '#eff6ff', // Light blue background
            DEFAULT: '#ffffff',
            dark: '#0f172a',
        },
        text: {
            primary: '#0f172a',
            secondary: '#64748b',
            light: '#94a3b8',
        },
    },
    // Shared colors
    common: {
        white: '#ffffff',
        black: '#000000',
        slate: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
    },
} as const;

export type AppTheme = 'client' | 'provider';
export type ColorPalette = typeof colors.client | typeof colors.provider;
