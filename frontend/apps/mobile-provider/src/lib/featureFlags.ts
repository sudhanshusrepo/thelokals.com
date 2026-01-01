export const PROVIDER_DESIGN_V2 = 'useProviderDesignV2';

export const featureFlags = {
    [PROVIDER_DESIGN_V2]: true // PRODUCTION ROLLOUT: 1.0 (100% Enabled)
};

export const useFeatureFlag = (flag: string): boolean => {
    // In a real implementation, this would connect to Firebase Remote Config or similar.
    // For now, it returns the local configuration.
    return featureFlags[flag as keyof typeof featureFlags] ?? false;
};
