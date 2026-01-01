/**
 * Colors - Legacy compatibility layer
 * Now uses centralized theme tokens from @/theme
 * 
 * @deprecated Import from @/theme instead for new code
 */

import { colors } from '@/theme/colors';

const tintColorLight = colors.primary;
const tintColorDark = colors.primary;

export default {
  // Legacy light theme - now using theme tokens
  light: {
    text: colors.textPrimary,
    background: colors.bgSurface,
    tint: tintColorLight,
    tabIconDefault: colors.textSecondary,
    tabIconSelected: tintColorLight,
  },
  // Legacy dark theme - now using theme tokens
  dark: {
    text: colors.textOnDark,
    background: colors.bgCanvas,
    tint: tintColorDark,
    tabIconDefault: colors.textSecondary,
    tabIconSelected: tintColorDark,
  },

  // Direct color exports for backward compatibility
  teal: {
    DEFAULT: colors.primary,
    dark: colors.primaryDark,
    light: colors.primaryLight,
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    500: colors.primary,
    600: colors.primaryDark,
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },
  navy: {
    DEFAULT: colors.bgCanvas,
    light: colors.bgCanvasLight,
  },
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: colors.borderLight,
    300: colors.borderMedium,
    400: colors.borderDark,
    500: colors.textSecondary,
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: colors.bgCanvas,
  },

  // Status colors
  success: colors.statusSuccess,
  warning: colors.statusWarning,
  error: colors.statusError,
  info: colors.statusInfo,

  // Legacy color exports for backward compatibility
  blue: {
    DEFAULT: colors.statusInfo,
    50: '#eff6ff',
    100: '#dbeafe',
    500: colors.statusInfo,
    600: '#2563eb',
  },
  green: {
    DEFAULT: colors.statusSuccess,
    50: '#f0fdf4',
    100: '#dcfce7',
    500: colors.statusSuccess,
    600: colors.primaryDark,
    900: '#14532d',
  },
  red: {
    DEFAULT: colors.accentRed,
    50: '#fef2f2',
    100: '#fee2e2',
    500: colors.accentRed,
    600: '#dc2626',
    900: '#7f1d1d',
  },
  yellow: {
    DEFAULT: colors.accentAmber,
    50: '#fefce8',
    100: '#fef9c3',
  },
  amber: {
    DEFAULT: colors.accentAmber,
    50: '#fffbeb',
    100: '#fde68a',
    500: colors.accentAmber,
    800: '#92400e',
  },
  orange: {
    DEFAULT: '#F97316',
    50: '#fff7ed',
    100: '#ffedd5',
    500: '#f97316',
  },
  purple: {
    DEFAULT: '#A855F7',
    50: '#faf5ff',
    100: '#f3e8ff',
    500: '#a855f7',
    600: '#9333ea',
  },
  indigo: {
    DEFAULT: '#6366F1',
    50: '#eef2ff',
    100: '#e0e7ff',
    500: '#6366f1',
    600: '#4f46e5',
  },
};
