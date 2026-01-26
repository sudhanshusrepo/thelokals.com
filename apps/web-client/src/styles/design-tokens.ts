/**
 * lokals Client App Design Tokens
 * Reused from V2 System
 */

export const designTokens = {
    colors: {
        background: {
            primary: '#F0F0F0',
            surface: '#FFFFFF',
        },
        text: {
            primary: '#0E121A',
            secondary: 'rgba(14, 18, 26, 0.87)',
            tertiary: 'rgba(14, 18, 26, 0.74)',
            disabled: 'rgba(14, 18, 26, 0.60)',
        },
        gradient: {
            start: '#F7C846',
            end: '#8AE98D',
            css: 'linear-gradient(135deg, #F7C846 0%, #8AE98D 100%)',
        },
        accent: {
            danger: '#FC574E',
            warning: '#F7C846',
            success: '#8AE98D',
        },
        shadow: {
            rgba: 'rgba(14, 18, 26, 0.08)',
        },
    },
    spacing: {
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '20px',
        xl: '24px',
        '2xl': '32px',
        '3xl': '40px',
        '4xl': '48px',
    },
    radius: {
        hero: '24px',
        card: '16px',
        pill: '20px',
        btn: '12px',
        sm: '8px',
        full: '9999px',
    },
    shadows: {
        card: '0 8px 32px rgba(14, 18, 26, 0.08)',
        heroGlow: '0 0 0 1px rgba(247, 200, 70, 0.2) inset',
        floating: '0 12px 40px rgba(252, 87, 78, 0.15)',
        elevated: '0 4px 16px rgba(14, 18, 26, 0.12)',
    }
} as const;
