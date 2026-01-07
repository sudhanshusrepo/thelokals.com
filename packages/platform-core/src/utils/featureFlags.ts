/**
 * Feature Flag System for Lokals Client App Renovation
 * Enables controlled rollout of new design system
 */

import * as React from 'react';

// Feature flag constants
export const CLIENT_DESIGN_V2 = 'useClientDesignV2';

// Feature flag configuration
export const featureFlags = {
    [CLIENT_DESIGN_V2]: false, // Master switch (default: OFF for safety)
    v2RolloutPercentage: 10, // Percentage of users to show v2 (0-100)
} as const;

// Type for feature flag keys
export type FeatureFlagKey = keyof typeof featureFlags;

/**
 * Get feature flag value
 * Checks localStorage first (for dev/staging), then falls back to config
 * 
 * @param flag - Feature flag key
 * @returns boolean indicating if feature is enabled
 */
export const getFeatureFlag = (flag: FeatureFlagKey): boolean => {
    // Check localStorage for override (dev/staging)
    if (typeof window !== 'undefined' && window.localStorage) {
        const localValue = localStorage.getItem(flag);
        if (localValue !== null) {
            return localValue === 'true';
        }
    }

    // Fall back to config
    const value = featureFlags[flag];
    return typeof value === 'boolean' ? value : false;
};

/**
 * Set feature flag value in localStorage (dev/staging only)
 * 
 * @param flag - Feature flag key
 * @param value - boolean value to set
 */
export const setFeatureFlag = (flag: FeatureFlagKey, value: boolean): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(flag, value.toString());
    }
};

/**
 * Clear feature flag override from localStorage
 * 
 * @param flag - Feature flag key
 */
export const clearFeatureFlag = (flag: FeatureFlagKey): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(flag);
    }
};

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
 * Check if user should see v2 design based on rollout percentage
 * Uses deterministic hash of user ID for consistent experience
 * 
 * @param userId - Optional user ID for logged-in users
 * @returns boolean indicating if user should see v2 design
 */
export const shouldShowV2 = (userId?: string): boolean => {
    // Check localStorage override first (dev/staging)
    if (typeof window !== 'undefined' && window.localStorage) {
        const override = localStorage.getItem(CLIENT_DESIGN_V2);
        if (override !== null) {
            return override === 'true';
        }
    }

    // If master switch is disabled, return false
    if (!featureFlags[CLIENT_DESIGN_V2]) {
        return false;
    }

    const percentage = featureFlags.v2RolloutPercentage;

    // If 100% rollout, return true
    if (percentage >= 100) {
        return true;
    }

    // If 0% rollout, return false
    if (percentage <= 0) {
        return false;
    }

    // Server-side check: impossible to know anonymous bucket, default to false (safe)
    if (typeof window === 'undefined') {
        return false;
    }

    // 1. Check for logged-in user (highest priority for consistency)
    if (userId) {
        const hash = simpleHash(userId);
        const bucket = hash % 100;
        return bucket < percentage;
    }

    // 2. Check for persisted localStorage bucket (anonymous user consistency)
    const STORAGE_KEY = 'lokals_v2_bucket';
    try {
        let bucket = parseInt(localStorage.getItem(STORAGE_KEY) || '', 10);

        if (isNaN(bucket)) {
            // Generate new random bucket for new anonymous user
            bucket = Math.floor(Math.random() * 100);
            localStorage.setItem(STORAGE_KEY, bucket.toString());
        }

        return bucket < percentage;
    } catch (e) {
        // Fallback for private browsing / blocked storage
        return false;
    }
};

/**
 * React hook for feature flags (web only)
 * For CLIENT_DESIGN_V2, uses percentage rollout logic
 * For React Native, use getFeatureFlag directly
 * 
 * @param flag - Feature flag key
 * @param userId - Optional user ID for percentage rollout
 * @returns boolean indicating if feature is enabled
 */
export const useFeatureFlag = (flag: FeatureFlagKey, userId?: string): boolean => {
    // Special handling for CLIENT_DESIGN_V2 with percentage rollout
    if (flag === CLIENT_DESIGN_V2) {
        // Use state to handle client-side only check (avoid hydration mismatch)
        const [showV2, setShowV2] = React.useState(false);

        React.useEffect(() => {
            setShowV2(shouldShowV2(userId));
        }, [userId]);

        return showV2;
    }

    // For other flags, use simple boolean check
    return getFeatureFlag(flag);
};

// Firebase Remote Config integration (optional, for production)
// Uncomment and implement when ready for production rollout
/*
import { getRemoteConfig, getValue, fetchAndActivate } from 'firebase/remote-config';

export const initRemoteConfig = async () => {
  const remoteConfig = getRemoteConfig();
  remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // 1 hour
  
  // Set defaults
  remoteConfig.defaultConfig = {
    [CLIENT_DESIGN_V2]: false,
  };
  
  await fetchAndActivate(remoteConfig);
};

export const getRemoteFeatureFlag = (flag: FeatureFlagKey): boolean => {
  const remoteConfig = getRemoteConfig();
  return getValue(remoteConfig, flag).asBoolean();
};
*/
