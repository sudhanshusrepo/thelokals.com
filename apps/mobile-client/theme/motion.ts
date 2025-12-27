/**
 * Motion Tokens
 * Consistent animation timing and easing for micro-interactions
 */

import { Easing } from 'react-native';

export const motion = {
    // Duration (in milliseconds)
    durationFast: 150,
    durationNormal: 220,
    durationSlow: 320,

    // Easing curves
    easingStandard: Easing.bezier(0.4, 0.0, 0.2, 1),
    easingDecelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
    easingAccelerate: Easing.bezier(0.4, 0.0, 1, 1),
    easingSharp: Easing.bezier(0.4, 0.0, 0.6, 1),

    // Spring configs
    springConfig: {
        damping: 15,
        mass: 1,
        stiffness: 150,
    },

    springConfigGentle: {
        damping: 20,
        mass: 1,
        stiffness: 120,
    },
} as const;

// Animation presets for common interactions
export const animations = {
    // Card press
    cardPress: {
        scale: 0.98,
        duration: motion.durationFast,
        easing: motion.easingStandard,
    },

    // Button press
    buttonPress: {
        scale: 0.96,
        duration: motion.durationFast,
        easing: motion.easingStandard,
    },

    // Fade in
    fadeIn: {
        opacity: {
            from: 0,
            to: 1,
        },
        duration: motion.durationNormal,
        easing: motion.easingDecelerate,
    },

    // Slide up
    slideUp: {
        translateY: {
            from: 20,
            to: 0,
        },
        duration: motion.durationNormal,
        easing: motion.easingDecelerate,
    },

    // Focus border
    focusBorder: {
        duration: motion.durationSlow,
        easing: motion.easingStandard,
    },
} as const;

export type MotionToken = keyof typeof motion;
export type AnimationPreset = keyof typeof animations;
