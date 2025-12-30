export const PROVIDER_DESIGN_V2 = 'useProviderDesignV2';

export const featureFlags = {
    [PROVIDER_DESIGN_V2]: true // RAMP: 0.1 -> 0.5 -> 1.0
};

export const useFeatureFlag = (flag: string): boolean => {
    // In a real implementation, this would connect to Firebase Remote Config or similar.
    // For now, it returns the local configuration.
    return featureFlags[flag as keyof typeof featureFlags] ?? false;
};
