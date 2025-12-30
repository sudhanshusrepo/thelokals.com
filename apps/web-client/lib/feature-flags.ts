/**
 * Feature Flag System for lokals Client App v3.0
 * Enables gradual rollout and instant rollback of v2 design
 */

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

    // If no userId, use random assignment (for anonymous users)
    if (!userId) {
        return Math.random() * 100 < featureFlags.v2RolloutPercentage;
    }

    // Deterministic hash-based assignment
    const hash = simpleHash(userId);
    const bucket = hash % 100;
    return bucket < featureFlags.v2RolloutPercentage;
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

    // Client-side: can add dynamic config fetching here
    return featureFlags[flag] as boolean;
}

/**
 * React hook for v2 design check with user-based rollout
 */
export function useV2Design(userId?: string): boolean {
    if (typeof window === 'undefined') {
        return false; // SSR: default to v1
    }

    return shouldShowV2(userId);
}
