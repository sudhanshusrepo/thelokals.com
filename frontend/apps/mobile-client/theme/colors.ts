/**
 * Sinport-inspired Color Palette
 * Single source of truth for all color tokens
 */

export const colors = {
    // Primary - Lokals Green
    primary: '#8AE98D',
    primaryDark: '#6BC96E',
    primaryLight: '#A8F4AB',

    // Secondary - Deep Canvas
    bgCanvas: '#0E121A',
    bgCanvasLight: '#1A1F2E',

    // Accents
    accentAmber: '#F7C846',
    accentAmberLight: '#FADA6A',
    accentRed: '#FC574E',
    accentRedLight: '#FD7A73',

    // Backgrounds
    bgSurface: '#FFFFFF',
    bgCard: '#F0F0F0',
    bgCardHover: '#E8E8E8',

    // Text
    textPrimary: '#0E121A',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    textOnDark: '#FFFFFF',
    textOnPrimary: '#0E121A',

    // Status
    statusSuccess: '#8AE98D',
    statusWarning: '#F7C846',
    statusError: '#FC574E',
    statusInfo: '#3B82F6',

    // Borders
    borderLight: '#E2E8F0',
    borderMedium: '#CBD5E1',
    borderDark: '#94A3B8',

    // Shadows
    shadowLight: 'rgba(0, 0, 0, 0.05)',
    shadowMedium: 'rgba(0, 0, 0, 0.1)',
    shadowDark: 'rgba(0, 0, 0, 0.2)',

    // Overlays
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    overlayDark: 'rgba(0, 0, 0, 0.6)',
} as const;

// Semantic color mappings for easier usage
export const semanticColors = {
    // Buttons
    buttonPrimary: colors.primary,
    buttonPrimaryHover: colors.primaryDark,
    buttonPrimaryText: colors.textOnPrimary,

    // Cards
    cardBackground: colors.bgCard,
    cardBorder: colors.borderLight,
    cardShadow: colors.shadowMedium,

    // Status chips
    chipSuccess: colors.statusSuccess,
    chipWarning: colors.statusWarning,
    chipError: colors.statusError,
    chipDefault: colors.bgCard,

    // Navigation
    navBackground: colors.bgCanvas,
    navText: colors.textOnDark,
    navActive: colors.primary,
} as const;

export type ColorToken = keyof typeof colors;
export type SemanticColorToken = keyof typeof semanticColors;
