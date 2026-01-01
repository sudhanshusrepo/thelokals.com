/**
 * Typography Scale
 * Centralized font styles for headings, body text, and captions
 */

import { TextStyle } from 'react-native';

export const typography = {
    // Headings
    h1: {
        fontSize: 32,
        fontWeight: '700',
        lineHeight: 40,
        letterSpacing: -0.5,
    } as TextStyle,

    h2: {
        fontSize: 24,
        fontWeight: '600',
        lineHeight: 32,
        letterSpacing: -0.3,
    } as TextStyle,

    h3: {
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 28,
        letterSpacing: -0.2,
    } as TextStyle,

    // Subtitles
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 24,
        letterSpacing: 0,
    } as TextStyle,

    subtitleMedium: {
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 22,
        letterSpacing: 0,
    } as TextStyle,

    // Body
    body: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
        letterSpacing: 0,
    } as TextStyle,

    bodyMedium: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
        letterSpacing: 0,
    } as TextStyle,

    bodySmall: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 18,
        letterSpacing: 0,
    } as TextStyle,

    // Captions
    caption: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
        letterSpacing: 0.1,
    } as TextStyle,

    captionSmall: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        letterSpacing: 0.1,
    } as TextStyle,

    // Labels
    label: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
        letterSpacing: 0.1,
    } as TextStyle,

    labelSmall: {
        fontSize: 12,
        fontWeight: '500',
        lineHeight: 16,
        letterSpacing: 0.2,
    } as TextStyle,

    // Buttons
    button: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 24,
        letterSpacing: 0.2,
    } as TextStyle,

    buttonSmall: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
        letterSpacing: 0.2,
    } as TextStyle,
} as const;

export type TypographyToken = keyof typeof typography;

// Helper function to get typography style
export const getTypography = (token: TypographyToken): TextStyle => {
    return typography[token];
};
