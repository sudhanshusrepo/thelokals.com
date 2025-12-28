
import { Metadata } from 'next';
import ServiceContent from './ServiceContent';
import { supabase } from '@thelocals/core/services/supabase';

interface Props {
    params: Promise<{ code: string }>;
}

async function getService(code: string) {
    const { data } = await supabase
        .from('services')
        .select('*')
        .eq('code', code)
        .single();
    return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { code } = await params;
    const service = await getService(code);

    if (!service) {
        return {
            title: 'Service Not Found | lokals',
            description: 'The requested service could not be found.'
        };
    }

    return {
        title: `${service.name} | lokals`,
        description: service.description,
        openGraph: {
            title: `${service.name} - Book on lokals`,
            description: service.description,
            type: 'website', // 'product' isn't supported in standard Next.js OG types easily, sticking to website or simple objects
            images: ['/og-image.jpg'], // Dynamic images per service would be better but keeping simple for now
        }
    };
}

export default async function ServicePage({ params }: Props) {
    const { code } = await params;
    const service = await getService(code);

    if (!service) {
        return <ServiceContent />;
    }

    // JSON-LD Structured Data for Service
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": service.name,
        "description": service.description,
        "provider": {
            "@type": "Organization",
            "name": "lokals"
        },
        "areaServed": {
            "@type": "City",
            "name": "Mumbai" // Defaulting to generic city for now
        },
        "offers": {
            "@type": "Offer",
            "price": service.base_price_cents / 100,
            "priceCurrency": "INR"
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ServiceContent initialService={service} />
        </>
    );
}
