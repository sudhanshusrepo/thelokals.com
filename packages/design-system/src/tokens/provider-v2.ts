export const PROVIDER_V2_TOKENS = {
    colors: {
        bgPrimary: '#F0F0F0',
        textPrimary: '#0E121A',
        gradientStart: '#F7C846',
        gradientEnd: '#8AE98D',
        accentDanger: '#FC574E',
        successGreen: '#8AE98D',
        shadowRgba: 'rgba(14,18,26,0.08)'
    },
    typography: {
        fontFamily: 'Poppins',
        h1: { fontSize: 32, fontWeight: '700', color: '#0E121A' },
        h2: { fontSize: 24, fontWeight: '600', color: '#0E121A' },
        body: { fontSize: 16, fontWeight: '400', color: 'rgba(14,18,26,0.87)' },
        label: { fontSize: 14, fontWeight: '500', color: 'rgba(14,18,26,0.74)' },
        caption: { fontSize: 12, fontWeight: '400', color: 'rgba(14,18,26,0.60)' }
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
        button: 12
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
            // React Native doesn't support inset shadows natively in the same way, 
            // will likely need a workaround or specific implementation in component
            shadowColor: '#F7C846',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.2,
            shadowRadius: 10,
        }
    }
} as const;
