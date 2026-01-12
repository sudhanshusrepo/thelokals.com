'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useBooking } from '../../../contexts/BookingContext';
import { designTokensV2 } from '../../../theme/design-tokens-v2';
import { GoogleMapWrapper } from './GoogleMapWrapper';
import { ArrowLeft, Star, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ServiceCategory } from '@thelocals/platform-core';
import { Surface, Section } from '../../../components/ui/Wrappers';
import { getServiceImageUrl } from '../../../utils/imageUtils';

interface ServiceDetailClientProps {
    service: ServiceCategory;
}

export function ServiceDetailClient({ service }: ServiceDetailClientProps) {
    const router = useRouter();
    const { startBooking } = useBooking();

    // SEO Structured Data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.name,
        image: getServiceImageUrl(service.name),
        description: `Professional ${service.name} services in Mumbai, Delhi, and Bangalore.`,
        provider: {
            '@type': 'LocalBusiness',
            name: 'Lokals - Trusted Home Services'
        },
        offers: {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price: service.base_price || 499,
            priceValidUntil: '2026-12-31'
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            reviewCount: '120'
        }
    };

    const handleBookNow = () => {
        startBooking({
            serviceCategory: service,
            serviceName: service.name,
            price: service.base_price || 0,
            image: (service as any).image_url || 'https://images.unsplash.com/photo-1581094794329-cd109678e7ea?auto=format&fit=crop&w=200&q=80'
        });

        router.push(`/book?category_id=${service.id}`);
    };

    return (
        <div style={{ paddingBottom: '100px', backgroundColor: '#fff' }} className="min-h-screen">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative">
                {/* Hero Image Header */}
                <div className="relative h-[300px] w-full">
                    <Image
                        src={getServiceImageUrl(service.name)}
                        alt={service.name}
                        fill
                        className="object-contain p-8 bg-gray-50" // Contain for SVGs, light bg
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/20" />

                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="absolute top-6 left-6 p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                </div>

                <div className="px-6 -mt-8 relative z-10">
                    {/* Title Card */}
                    <Surface elevated className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">{service.name}</h1>
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                    <span className="flex items-center gap-1 font-medium text-lokals-yellow">
                                        <Star size={14} className="fill-lokals-yellow" />
                                        4.8 (120 reviews)
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} />
                                        60 min
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Starts at</div>
                                <div className="text-xl font-bold text-lokals-green">
                                    {service.base_price ? `₹${service.base_price}` : 'Price on Request'}
                                </div>
                            </div>
                        </div>
                    </Surface>

                    {/* Best Match Badge */}
                    <Surface className="mt-6 flex items-center gap-3 p-4 bg-green-50 border border-green-100 !shadow-none">
                        <div className="p-2 bg-green-100 rounded-full text-green-700">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <div className="font-bold text-green-800 text-sm">Provider Blind Assignment</div>
                            <div className="text-xs text-green-700">We automatically assign the highest-rated pro available near you.</div>
                        </div>
                    </Surface>

                    {/* Description / What's Included */}
                    <div className="mt-8">
                        <h3 className="text-lg font-bold mb-4">What's Included</h3>
                        <ul className="space-y-3 mb-8">
                            {['Professional Service', 'Post-service cleanup', '7-day warranty', 'Locals safety assurance'].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-v2-text-secondary">
                                    <CheckCircle2 size={18} className="text-v2-accent-success" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Pros Nearby Map */}
                    <div className="mt-8 mb-24">
                        <h3 className="text-lg font-bold mb-2">Service Availability</h3>
                        <p className="text-sm text-gray-500 mb-4">See active professionals in your area.</p>
                        <div className="h-64 w-full rounded-2xl overflow-hidden shadow-inner border border-gray-100 relative bg-gray-100">
                            {/* 
                          NOTE: This requires NEXT_PUBLIC_GOOGLE_MAPS_KEY to be set in .env 
                          If missing, it might show a development warning or gray box.
                        */}
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 z-0">
                                Loading Map...
                            </div>
                            {/* Dynamic Import or Client Component usage */}
                            <div className="absolute inset-0 z-10">
                                {/* We use a dynamic check or error boundary in real apps. Here we assume the key exists or fails gracefully */}
                                <GoogleMapWrapper />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
                    <button
                        onClick={handleBookNow}
                        style={{ background: designTokensV2.colors.gradient.css }}
                        className="w-full py-4 rounded-v2-pill text-v2-text-primary font-bold text-lg shadow-lg active:scale-[0.99] transition-transform"
                    >
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );
}
