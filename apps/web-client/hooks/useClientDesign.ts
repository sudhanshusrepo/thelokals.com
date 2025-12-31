/**
 * useClientDesign Hook
 * Conditionally applies client-v2 design system based on feature flag
 * Web client implementation - now uses core package
 */

import { shouldShowV2, CLIENT_DESIGN_V2 } from '@thelocals/core';
import { CLIENT_V2_TOKENS } from '@lokals/design-system';
import { useState, useEffect } from 'react';

export const useClientDesign = (userId?: string) => {
    const [isV2Enabled, setIsV2Enabled] = useState(false);

    useEffect(() => {
        setIsV2Enabled(shouldShowV2(userId));
    }, [userId]);

    return {
        isV2Enabled,
        tokens: isV2Enabled ? CLIENT_V2_TOKENS : null,
        // Helper to conditionally apply v2 classes
        v2Class: (v2ClassName: string, fallbackClassName?: string) => {
            return isV2Enabled ? v2ClassName : (fallbackClassName || '');
        },
        // Helper to get v2 CSS variable
        v2Var: (varName: string) => {
            return isV2Enabled ? `var(--v2-${varName})` : undefined;
        },
    };
};

// Type export
export type ClientDesignHook = ReturnType<typeof useClientDesign>;
