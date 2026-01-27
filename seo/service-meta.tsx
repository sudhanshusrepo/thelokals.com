
// seo/service-meta.tsx
import React from 'react';
import Head from 'next/head';

interface ServiceMetaProps {
    serviceName: string;
    pincode: string;
    areaName?: string;
}

const ServiceMeta: React.FC<ServiceMetaProps> = ({ serviceName, pincode, areaName }) => {
    const title = `Best ${serviceName} in ${areaName || pincode} | The Lokals`;
    const description = `Book trusted ${serviceName} services in ${pincode}. Verified professionals, instant booking.`;

    const schema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": serviceName,
        "areaServed": {
            "@type": "PostalAddress",
            "postalCode": pincode,
            "addressCountry": "IN"
        },
        "provider": {
            "@type": "Organization",
            "name": "The Lokals"
        }
    };

    return (
        <Head>
            <title>{title}</title>
            <meta name="description" content={description} />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
        </Head>
    );
};

export default ServiceMeta;
