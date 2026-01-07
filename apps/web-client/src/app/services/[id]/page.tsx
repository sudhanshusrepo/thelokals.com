import { Metadata } from 'next';
import { adminService } from '@thelocals/platform-core';
export const dynamic = 'force-dynamic';
import { ServiceDetailClient } from './ServiceDetailClient';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getService(id: string) {
    // Mock for build stability
    if (process.env.NODE_ENV === 'production' && !process.env.SUPABASE_URL) {
        return null;
    }
    try {
        const services = await adminService.getServiceCategories();
        return services.find(s => s.id === id) || null;
    } catch (e) {
        return null;
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const service = await getService(id);

    if (!service) {
        return {
            title: 'Service Not Found | The Locals',
        };
    }

    return {
        title: `Best ${service.name} in Gurugram | Verified Pros | The Locals`,
        description: `Book top-rated ${service.name} services in Gurugram. Starts at ₹${service.base_price || 499}. Verified professionals, 7-day warranty, and explicit safety checks.`,
        openGraph: {
            title: `${service.name} Service in Gurugram`,
            description: `Book ${service.name} at your doorstep in Gurugram.`,
            images: [(service as any).image_url || 'https://images.unsplash.com/photo-1581094794329-cd109678e7ea'],
        },
    };
}

export default async function ServiceDetailPage({ params }: PageProps) {
    const { id } = await params;
    const service = await getService(id);

    if (!service) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': `${service.name} in Gurugram`,
        'provider': {
            '@type': 'LocalBusiness',
            'name': 'The Locals',
            'image': 'https://thelokals.com/icon',
            'address': {
                '@type': 'PostalAddress',
                'addressLocality': 'Gurugram',
                'addressRegion': 'Haryana',
                'addressCountry': 'IN'
            },
            'priceRange': '$$'
        },
        'areaServed': {
            '@type': 'City',
            'name': 'Gurugram'
        },
        'offers': {
            '@type': 'Offer',
            'price': service.base_price || 499,
            'priceCurrency': 'INR',
            'availability': 'https://schema.org/InStock'
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ServiceDetailClient service={service} />
        </>
    );
}
