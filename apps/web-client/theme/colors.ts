/**
 * Lokals Brand Color System
 * Centralized color tokens for the new teal-green and navy theme
 */

export const colors = {
    // Primary - Lokals Green (Vivid teal-green)
    primary: '#1EC97A',
    primaryDark: '#16B56B',
    primaryLight: '#4DD494',

    // Secondary - Deep Tech Navy
    secondary: '#042B3B',
    secondaryLight: '#063245',
    secondaryDark: '#021A24',

    // Accents
    accent: {
        orange: '#FF6B35', // Warm orange (roof-inspired) for badges, ratings
        sky: '#E0F7FA',    // Soft sky (pale teal-blue) for subtle fills, chips
    },

    // Neutrals (blue-tinted greys)
    neutral: {
        900: '#0F172A',
        800: '#1E293B',
        700: '#334155',
        600: '#475569',
        500: '#64748B',
        400: '#94A3B8',
        300: '#CBD5E1',
        200: '#E2E8F0',
        100: '#F1F5F9',
        50: '#F8FAFC',
    },

    // Semantic colors
    success: '#1EC97A',
    warning: '#FF6B35',
    error: '#EF4444',
    info: '#3B82F6',

    // Legacy aliases for backwards compatibility
    // These map old color names to new tokens
    teal: '#1EC97A',      // maps to new primary
    indigo: '#042B3B',    // maps to new secondary
    slate: {
        900: '#0F172A',
        800: '#1E293B',
        700: '#334155',
        600: '#475569',
        500: '#64748B',
        400: '#94A3B8',
        300: '#CBD5E1',
        200: '#E2E8F0',
        100: '#F1F5F9',
        50: '#F8FAFC',
    },
} as const;

/**
 * Motion tokens for consistent animations
 */
export const motion = {
    duration: {
        fast: 150,      // Quick interactions (button press)
        normal: 220,    // Standard transitions
        slow: 350,      // Deliberate animations (page transitions)
        pulse: 10000,   // Slow pulse for AI indicator (10s)
    },
    easing: {
        standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
        decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
        accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
} as const;

/**
 * Gradient definitions
 */
export const gradients = {
    primary: 'linear-gradient(135deg, #1EC97A 0%, #042B3B 100%)',
    hero: 'linear-gradient(180deg, rgba(4, 43, 59, 0.3) 0%, rgba(4, 43, 59, 0.95) 100%)',
    heroBackground: 'linear-gradient(135deg, #042B3B 0%, #063245 100%)',
    elevated: 'linear-gradient(135deg, rgba(30, 201, 122, 0.1) 0%, rgba(4, 43, 59, 0.05) 100%)',
} as const;

/**
 * Shadow definitions for 3D effects
 */
export const shadows = {
    sm: '0 1px 2px 0 rgba(4, 43, 59, 0.05)',
    md: '0 4px 6px -1px rgba(4, 43, 59, 0.1), 0 2px 4px -1px rgba(4, 43, 59, 0.06)',
    lg: '0 10px 15px -3px rgba(4, 43, 59, 0.1), 0 4px 6px -2px rgba(4, 43, 59, 0.05)',
    xl: '0 20px 25px -5px rgba(4, 43, 59, 0.1), 0 10px 10px -5px rgba(4, 43, 59, 0.04)',
    elevated: '0 25px 50px -12px rgba(4, 43, 59, 0.25), 0 12px 24px -8px rgba(30, 201, 122, 0.15)',
    hero: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
} as const;

export type ColorToken = keyof typeof colors;
export type MotionToken = keyof typeof motion;
