/**
 * useClientDesign Hook
 * Conditionally applies client-v2 design system based on feature flag
 * React Native implementation
 */

import { getFeatureFlag, CLIENT_DESIGN_V2 } from '@thelocals/core';
import { CLIENT_V2_TOKENS } from '@lokals/design-system';
import { useState, useEffect } from 'react';

export const useClientDesign = () => {
    // For React Native, we use getFeatureFlag directly
    // In production, you might want to use AsyncStorage or Firebase Remote Config
    const [isV2Enabled, setIsV2Enabled] = useState(false);

    useEffect(() => {
        // Check feature flag on mount
        const enabled = getFeatureFlag(CLIENT_DESIGN_V2);
        setIsV2Enabled(enabled);
    }, []);

    return {
        isV2Enabled,
        tokens: isV2Enabled ? CLIENT_V2_TOKENS : null,
        // Helper to conditionally select styles
        v2Style: <T,>(v2Style: T, fallbackStyle?: T): T | undefined => {
            return isV2Enabled ? v2Style : fallbackStyle;
        },
    };
};

// Type export
export type ClientDesignHook = ReturnType<typeof useClientDesign>;
