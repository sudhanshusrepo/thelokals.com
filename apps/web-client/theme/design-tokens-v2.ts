/**
 * lokals Client App v3.0 Design Tokens
 * Extended design system for v2 components matching reference design
 */

export const designTokensV2 = {
    // Colors - Exact from reference design
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

    // Typography - Poppins font family
    typography: {
        fontFamily: {
            primary: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
        h1: {
            fontSize: '32px',
            fontWeight: 700, // bold
            lineHeight: '40px',
            color: '#0E121A',
        },
        h2: {
            fontSize: '24px',
            fontWeight: 600, // semibold
            lineHeight: '32px',
            color: '#0E121A',
        },
        bodyLg: {
            fontSize: '18px',
            fontWeight: 400, // regular
            lineHeight: '28px',
            color: 'rgba(14, 18, 26, 0.87)',
        },
        body: {
            fontSize: '16px',
            fontWeight: 400, // regular
            lineHeight: '24px',
            color: 'rgba(14, 18, 26, 0.87)',
        },
        label: {
            fontSize: '14px',
            fontWeight: 500, // medium
            lineHeight: '20px',
            color: 'rgba(14, 18, 26, 0.74)',
        },
        caption: {
            fontSize: '12px',
            fontWeight: 400, // regular
            lineHeight: '16px',
            color: 'rgba(14, 18, 26, 0.60)',
        },
    },

    // Spacing scale
    spacing: {
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '20px',
        xl: '24px',
        '2xl': '32px',
        '3xl': '40px',
        '4xl': '48px',
        '5xl': '56px',
        '6xl': '64px',
        '7xl': '80px',
        '8xl': '96px',
        '9xl': '120px',
    },

    // Border radius
    radius: {
        hero: '24px',
        card: '16px',
        pill: '20px',
        btn: '12px',
        sm: '8px',
        full: '9999px',
    },

    // Shadows
    shadows: {
        card: '0 8px 32px rgba(14, 18, 26, 0.08)',
        heroGlow: '0 0 0 1px rgba(247, 200, 70, 0.2) inset',
        floating: '0 12px 40px rgba(252, 87, 78, 0.15)',
        elevated: '0 4px 16px rgba(14, 18, 26, 0.12)',
        sm: '0 2px 8px rgba(14, 18, 26, 0.06)',
    },

    // Component dimensions
    dimensions: {
        heroCard: {
            width: '420px',
            height: '240px',
        },
        serviceCard: {
            width: '160px',
            height: '220px',
        },
        statusCard: {
            width: '360px',
            height: '120px',
        },
        floatingCta: {
            size: '56px',
        },
    },

    // Animation durations
    animation: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
        easing: {
            standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
            decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
            accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
        },
    },
} as const;

// CSS Custom Properties helper
export function generateV2CSSVariables() {
    return `
    /* V2 Design Tokens */
    --v2-bg-primary: ${designTokensV2.colors.background.primary};
    --v2-text-primary: ${designTokensV2.colors.text.primary};
    --v2-gradient-start: ${designTokensV2.colors.gradient.start};
    --v2-gradient-end: ${designTokensV2.colors.gradient.end};
    --v2-accent-danger: ${designTokensV2.colors.accent.danger};
    --v2-shadow-rgba: ${designTokensV2.colors.shadow.rgba};
    
    --v2-hero-r: ${designTokensV2.radius.hero};
    --v2-card-r: ${designTokensV2.radius.card};
    --v2-pill-r: ${designTokensV2.radius.pill};
    --v2-btn-r: ${designTokensV2.radius.btn};
    
    --v2-shadow-card: ${designTokensV2.shadows.card};
    --v2-shadow-hero-glow: ${designTokensV2.shadows.heroGlow};
    --v2-shadow-floating: ${designTokensV2.shadows.floating};
    
    --v2-font-family: ${designTokensV2.typography.fontFamily.primary};
  `;
}

// Type exports
export type DesignTokensV2 = typeof designTokensV2;
