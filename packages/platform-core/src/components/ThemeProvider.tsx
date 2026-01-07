"use client";
/**
 * Theme Context and Provider
 * Provides theme configuration throughout the application
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { AppTheme, ThemeConfig, getTheme, getThemeClasses } from '../theme';

interface ThemeContextValue {
    theme: AppTheme;
    config: ThemeConfig;
    classes: ReturnType<typeof getThemeClasses>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
    theme: AppTheme;
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ theme, children }) => {
    const config = getTheme(theme);
    const classes = getThemeClasses(theme);

    const value: ThemeContextValue = {
        theme,
        config,
        classes,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
