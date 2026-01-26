'use client';

export default function cloudflareLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
    const params = [`width=${width}`, `quality=${quality || 75}`, 'format=auto'];

    // If it's already a full URL (external), return as is or proxy if needed.
    // The user wants to utilise Cloudflare Images tool.
    // Standard CF Images URL: https://imagedelivery.net/<account_hash>/<image_id>/<variant>

    if (src.startsWith('https://imagedelivery.net')) {
        return `${src}/${params.join(',')}`;
        // Actually CF images usually use named variants like 'public', 'thumbnail'.
        // If using flexible variants, we might append parameters differently.
        // For now, let's assume we are using standard Next.js optimization on top or direct URL.
        return src;
    }

    // If it's a relative path (local asset), we might want to serve it via CF.
    // But purely for external Unsplash replacement:
    return src;
}

// Helper to construct CF Image URL if we had an ID
export const getCloudflareImageUrl = (imageId: string, variant: string = 'public') => {
    return `https://imagedelivery.net/f-b-p-k-h/${imageId}/${variant}`;
};
