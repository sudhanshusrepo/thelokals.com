export const HEADER_HEIGHTS = {
    mobile: 56,    // 14 * 4 (h-14)
    desktop: 64,   // 16 * 4 (h-16)
} as const;

export const HEADER_Z_INDEX = 50;

export const getSafeAreaStyles = () => ({
    paddingTop: 'env(safe-area-inset-top)',
    paddingBottom: 'env(safe-area-inset-bottom)',
    paddingLeft: 'env(safe-area-inset-left)',
    paddingRight: 'env(safe-area-inset-right)',
});
