'use client';

export default function cloudflareLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
    // 1. If it's a full URL (Unsplash, external), just return it.
    // We don't want to proxy external images through a broken logic locally.
    if (src.startsWith('http')) {
        return src;
    }

    // 2. Official Cloudflare Images logic
    // If the src is an ID (e.g., "b234-...") or relative path intended for CF
    if (src.startsWith('https://imagedelivery.net')) {
        const params = [`width=${width}`, `quality=${quality || 75}`, 'format=auto'];
        return `${src}/${params.join(',')}`;
    }

    // 3. Fallback for Local Assets
    // In dev, we might just want to return the src unchanged if it's local
    return src;
}

// Helper to construct CF Image URL if we had an ID
export const getCloudflareImageUrl = (imageId: string, variant: string = 'public') => {
    return `https://imagedelivery.net/f-b-p-k-h/${imageId}/${variant}`;
};
