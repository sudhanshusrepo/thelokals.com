/**
 * Theme System
 * Unified export of all theme tokens
 */

export * from './colors';
export * from './typography';
export * from './motion';
export * from './spacing';

import { colors, semanticColors } from './colors';
import { typography } from './typography';
import { motion, animations } from './motion';
import { spacing } from './spacing';

// Unified theme object
export const theme = {
    colors,
    semanticColors,
    typography,
    motion,
    animations,
    spacing,
} as const;

export default theme;
