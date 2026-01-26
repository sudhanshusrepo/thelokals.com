export const SERVICE_IMAGES: Record<string, string> = {
    'Cleaning': 'https://images.unsplash.com/photo-1581578731117-104f2a8d275d?q=80&w=800&auto=format&fit=crop',
    'Repair': 'https://images.unsplash.com/photo-1581092921461-eab62e97a783?q=80&w=800&auto=format&fit=crop',
    'Painting': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800&auto=format&fit=crop',
    'Plumbing': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=800&auto=format&fit=crop',
    'Electrical': 'https://images.unsplash.com/photo-1621905476317-0c92c9374817?q=80&w=800&auto=format&fit=crop',
    'Moving': 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800&auto=format&fit=crop',
    'Default': 'https://images.unsplash.com/photo-1632733711679-529f9bf84db6?q=80&w=800&auto=format&fit=crop'
};

export function getServiceImage(serviceName?: string): string {
    if (!serviceName) return SERVICE_IMAGES['Default'];

    // Simple partial match
    const key = Object.keys(SERVICE_IMAGES).find(k =>
        serviceName.toLowerCase().includes(k.toLowerCase())
    );

    return key ? SERVICE_IMAGES[key] : SERVICE_IMAGES['Default'];
}
