
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface ServiceData {
    name: string;
    description: string;
    url: string;
}

export const ServiceStructuredData: React.FC<ServiceData> = ({ name, description, url }) => (
    <Helmet>
        <script type="application/ld+json">
            {`
                {
                    "@context": "https://schema.org",
                    "@type": "Service",
                    "name": "${name}",
                    "description": "${description}",
                    "url": "${url}"
                }
            `}
        </script>
    </Helmet>
);

interface ProviderData {
    name: string;
    jobTitle: string;
    url: string;
}

export const ProviderStructuredData: React.FC<ProviderData> = ({ name, jobTitle, url }) => (
    <Helmet>
        <script type="application/ld+json">
            {`
                {
                    "@context": "https://schema.org",
                    "@type": "Person",
                    "name": "${name}",
                    "jobTitle": "${jobTitle}",
                    "url": "${url}"
                }
            `}
        </script>
    </Helmet>
);
