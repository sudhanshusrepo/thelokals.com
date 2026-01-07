/**
 * Theme Configuration
 * Main theme system configuration and utilities
 */

import { colors, AppTheme, ColorPalette } from './colors';

export interface ThemeConfig {
    name: AppTheme;
    colors: ColorPalette;
    spacing: {
        header: string;
        bottomNav: string;
        container: string;
    };
    borderRadius: {
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
}

export const themes: Record<AppTheme, ThemeConfig> = {
    client: {
        name: 'client',
        colors: colors.client,
        spacing: {
            header: '64px',
            bottomNav: '80px',
            container: 'max-w-7xl',
        },
        borderRadius: {
            sm: '0.375rem',
            md: '0.5rem',
            lg: '0.75rem',
            xl: '1rem',
        },
    },
    provider: {
        name: 'provider',
        colors: colors.provider,
        spacing: {
            header: '64px',
            bottomNav: '80px',
            container: 'max-w-7xl',
        },
        borderRadius: {
            sm: '0.375rem',
            md: '0.5rem',
            lg: '0.75rem',
            xl: '1rem',
        },
    },
};

/**
 * Get theme configuration by name
 */
export const getTheme = (themeName: AppTheme): ThemeConfig => {
    return themes[themeName];
};

/**
 * Get Tailwind CSS classes for theme
 */
export const getThemeClasses = (themeName: AppTheme) => {
    const isClient = themeName === 'client';

    return {
        // Background colors
        bgLight: isClient ? 'bg-[#f0fdf4]' : 'bg-[#eff6ff]',
        bgDark: 'bg-slate-900',
        bgCard: 'bg-white dark:bg-slate-800',

        // Primary colors
        primary: isClient ? 'bg-teal-600' : 'bg-blue-600',
        primaryHover: isClient ? 'hover:bg-teal-700' : 'hover:bg-blue-700',
        primaryText: isClient ? 'text-teal-600' : 'text-blue-600',
        primaryTextHover: isClient ? 'hover:text-teal-700' : 'hover:text-blue-700',

        // Border colors
        primaryBorder: isClient ? 'border-teal-600' : 'border-blue-600',

        // Ring colors (focus states)
        primaryRing: isClient ? 'ring-teal-500' : 'ring-blue-500',

        // Gradient backgrounds
        primaryGradient: isClient
            ? 'bg-gradient-to-r from-teal-600 to-emerald-600'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600',
    };
};

export { colors, type AppTheme, type ColorPalette };
