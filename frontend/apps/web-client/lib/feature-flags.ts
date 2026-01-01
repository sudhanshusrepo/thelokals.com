/**
 * Feature Flag System for lokals Client App v3.0
 * Enables gradual rollout and instant rollback of v2 design
 */

'use client';

import { useEffect, useState } from 'react';

export interface FeatureFlags {
    useClientDesignV2: boolean;
    v2RolloutPercentage: number;
}

// Environment-based feature flags
export const featureFlags: FeatureFlags = {
    // Enable v2 design system (default: false for safety)
    useClientDesignV2: process.env.NEXT_PUBLIC_CLIENT_DESIGN_V2 === 'true',

    // Percentage of users to show v2 (0-100)
    v2RolloutPercentage: parseInt(process.env.NEXT_PUBLIC_V2_ROLLOUT || '0', 10),
};

const STORAGE_KEY = 'lokals_v2_bucket';

/**
 * Check if user should see v2 design based on rollout percentage
 * Uses deterministic hash of user ID for consistent experience
 */
export function shouldShowV2(userId?: string): boolean {
    // If flag is explicitly disabled, return false
    if (!featureFlags.useClientDesignV2) {
        return false;
    }

    // If 100% rollout, return true
    if (featureFlags.v2RolloutPercentage >= 100) {
        return true;
    }

    // If 0% rollout, return false
    if (featureFlags.v2RolloutPercentage <= 0) {
        return false;
    }

    // Server-side check: impossible to know anonymous bucket, default to false (safe)
    if (typeof window === 'undefined') {
        return false;
    }

    // 1. Check for logged-in user (highest priority consistency)
    if (userId) {
        const hash = simpleHash(userId);
        const bucket = hash % 100;
        return bucket < featureFlags.v2RolloutPercentage;
    }

    // 2. Check for persisted local storage bucket (anonymous consistency)
    try {
        let bucket = parseInt(localStorage.getItem(STORAGE_KEY) || '', 10);

        if (isNaN(bucket)) {
            // Generate new random bucket for new anonymous user
            bucket = Math.floor(Math.random() * 100);
            localStorage.setItem(STORAGE_KEY, bucket.toString());
        }

        return bucket < featureFlags.v2RolloutPercentage;
    } catch (e) {
        // Fallback for private browsing / blocked storage
        return false;
    }
}

/**
 * Simple hash function for consistent user bucketing
 */
function simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}

/**
 * React hook for feature flag usage
 */
export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
    if (typeof window === 'undefined') {
        return featureFlags[flag] as boolean;
    }
    return featureFlags[flag] as boolean;
}

/**
 * React hook for v2 design check with user-based rollout
 */
export function useV2Design(userId?: string): boolean {
    // We need state to handle clientside-only storage check to avoid hydration mismatch
    const [showV2, setShowV2] = useState(false);

    useEffect(() => {
        setShowV2(shouldShowV2(userId));
    }, [userId]);

    return showV2;
}
