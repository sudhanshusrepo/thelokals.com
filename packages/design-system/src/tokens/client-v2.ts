/**
 * CLIENT V2 DESIGN TOKENS
 * Design system for Lokals Client App Renovation
 * Provider-blind, auto-assignment focused design
 */

export const CLIENT_V2_TOKENS = {
    colors: {
        bgPrimary: '#F0F0F0',
        bgSurface: '#FFFFFF',
        textPrimary: '#0E121A',
        textSecondary: 'rgba(14,18,26,0.87)',
        textTertiary: 'rgba(14,18,26,0.74)',
        textDisabled: 'rgba(14,18,26,0.60)',
        gradientStart: '#F7C846',
        gradientEnd: '#8AE98D',
        accentDanger: '#FC574E',
        accentSuccess: '#8AE98D',
        accentWarning: '#F7C846',
        shadowRgba: '14,18,26,0.08'
    },
    typography: {
        fontFamily: 'Poppins',
        h1: {
            fontSize: 32,
            fontWeight: '700' as const,
            color: '#0E121A',
            lineHeight: 40
        },
        h2: {
            fontSize: 24,
            fontWeight: '600' as const,
            color: '#0E121A',
            lineHeight: 32
        },
        body: {
            fontSize: 16,
            fontWeight: '400' as const,
            color: 'rgba(14,18,26,0.87)',
            lineHeight: 24
        },
        label: {
            fontSize: 14,
            fontWeight: '500' as const,
            color: 'rgba(14,18,26,0.74)',
            lineHeight: 20
        },
        caption: {
            fontSize: 12,
            fontWeight: '400' as const,
            color: 'rgba(14,18,26,0.60)',
            lineHeight: 16
        }
    },
    spacing: {
        xs: 8,
        sm: 12,
        md: 16,
        lg: 20,
        xl: 24,
        xxl: 32,
        '3xl': 40,
        '4xl': 48,
        '5xl': 56,
        '6xl': 64,
        '7xl': 80,
        '8xl': 96,
        '9xl': 120
    },
    radius: {
        hero: 24,
        card: 16,
        pill: 20,
        button: 12,
        sm: 8,
        full: 9999
    },
    shadows: {
        card: {
            shadowColor: '#0E121A',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.08,
            shadowRadius: 32,
            elevation: 8
        },
        heroGlow: {
            shadowColor: '#F7C846',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.2,
            shadowRadius: 10,
            elevation: 4
        },
        floating: {
            shadowColor: '#FC574E',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.15,
            shadowRadius: 40,
            elevation: 12
        },
        elevated: {
            shadowColor: '#0E121A',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 6
        }
    },
    dimensions: {
        heroCard: {
            width: 420,
            height: 240
        },
        serviceCard: {
            width: 160,
            height: 220
        },
        statusCard: {
            width: 360,
            height: 120
        },
        floatingCta: {
            size: 56
        }
    }
} as const;

// Web-specific CSS tokens
export const CLIENT_V2_CSS_TOKENS = {
    colors: {
        bgPrimary: '#F0F0F0',
        bgSurface: '#FFFFFF',
        textPrimary: '#0E121A',
        textSecondary: 'rgba(14,18,26,0.87)',
        textTertiary: 'rgba(14,18,26,0.74)',
        textDisabled: 'rgba(14,18,26,0.60)',
        gradientStart: '#F7C846',
        gradientEnd: '#8AE98D',
        gradientCss: 'linear-gradient(135deg, #F7C846 0%, #8AE98D 100%)',
        accentDanger: '#FC574E',
        accentSuccess: '#8AE98D',
        accentWarning: '#F7C846',
        shadowRgba: 'rgba(14,18,26,0.08)'
    },
    typography: {
        fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        h1: {
            fontSize: '32px',
            fontWeight: 700,
            lineHeight: '40px',
            color: '#0E121A'
        },
        h2: {
            fontSize: '24px',
            fontWeight: 600,
            lineHeight: '32px',
            color: '#0E121A'
        },
        body: {
            fontSize: '16px',
            fontWeight: 400,
            lineHeight: '24px',
            color: 'rgba(14,18,26,0.87)'
        },
        label: {
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: '20px',
            color: 'rgba(14,18,26,0.74)'
        },
        caption: {
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '16px',
            color: 'rgba(14,18,26,0.60)'
        }
    },
    spacing: {
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '20px',
        xl: '24px',
        xxl: '32px',
        '3xl': '40px',
        '4xl': '48px',
        '5xl': '56px',
        '6xl': '64px',
        '7xl': '80px',
        '8xl': '96px',
        '9xl': '120px'
    },
    radius: {
        hero: '24px',
        card: '16px',
        pill: '20px',
        button: '12px',
        sm: '8px',
        full: '9999px'
    },
    shadows: {
        card: '0 8px 32px rgba(14,18,26,0.08)',
        heroGlow: '0 0 0 1px rgba(247,200,70,0.2) inset',
        floating: '0 12px 40px rgba(252,87,78,0.15)',
        elevated: '0 4px 16px rgba(14,18,26,0.12)',
        sm: '0 2px 8px rgba(14,18,26,0.06)'
    },
    dimensions: {
        heroCard: {
            width: '420px',
            height: '240px'
        },
        serviceCard: {
            width: '160px',
            height: '220px'
        },
        statusCard: {
            width: '360px',
            height: '120px'
        },
        floatingCta: {
            size: '56px'
        }
    }
} as const;

// Type exports
export type ClientV2Tokens = typeof CLIENT_V2_TOKENS;
export type ClientV2CSSTokens = typeof CLIENT_V2_CSS_TOKENS;
