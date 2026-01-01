/**
 * Service Detail Page - V2 Design
 * Hero image, pricing, add-ons, and booking CTA
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ProviderBlindBadge, FloatingCta } from '@/components/v2';
import { useV2Design } from '@/lib/feature-flags';

// Mock service data (replace with API call)
const MOCK_SERVICE_DETAILS = {
    '1': {
        id: '1',
        name: 'Deep Cleaning Service',
        price: 499,
        rating: 4.9,
        reviews: 127,
        image: '/services/cleaning.webp',
        duration: '2 hours',
        description: 'Professional deep cleaning service for your entire home',
        included: [
            'Full house dusting & vacuuming',
            'Kitchen deep clean',
            'Bathroom sanitization',
            'Floor mopping all rooms',
        ],
        addons: [
            { id: 'addon1', name: 'Fridge cleaning', price: 99 },
            { id: 'addon2', name: 'Balcony area', price: 199 },
            { id: 'addon3', name: 'Windows cleaning', price: 149 },
        ],
    },
    // Add more services as needed
};

export default function ServiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const showV2 = useV2Design();
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

    const serviceId = params.id as string;
    const service = MOCK_SERVICE_DETAILS[serviceId as keyof typeof MOCK_SERVICE_DETAILS];

    if (!service) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h1>Service not found</h1>
            </div>
        );
    }

    if (!showV2) {
        return <div>Loading service details...</div>;
    }

    const toggleAddon = (addonId: string) => {
        setSelectedAddons((prev) =>
            prev.includes(addonId)
                ? prev.filter((id) => id !== addonId)
                : [...prev, addonId]
        );
    };

    const totalPrice =
        service.price +
        selectedAddons.reduce((sum, addonId) => {
            const addon = service.addons.find((a) => a.id === addonId);
            return sum + (addon?.price || 0);
        }, 0);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F0F0F0' }}>
            {/* Hero Image with Gradient Overlay */}
            <div style={{ position: 'relative', width: '100%', height: '300px' }}>
                <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                />
                {/* Gradient Overlay */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background:
                            'linear-gradient(180deg, transparent 0%, rgba(247,200,70,0.95) 100%)',
                        padding: '20px',
                        borderTopLeftRadius: '24px',
                        borderTopRightRadius: '24px',
                    }}
                >
                    <h1
                        style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#0E121A',
                            margin: 0,
                        }}
                    >
                        {service.name}
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div
                style={{
                    padding: '20px',
                    maxWidth: '800px',
                    margin: '0 auto',
                    paddingBottom: '120px', // Space for floating CTA
                }}
            >
                {/* Key Info Row */}
                <div
                    style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '16px',
                        marginBottom: '20px',
                        boxShadow: '0 4px 16px rgba(14,18,26,0.08)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <div>
                        <div style={{ fontSize: '28px', fontWeight: '700', color: '#0E121A' }}>
                            ₹{totalPrice}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                            {service.duration}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '24px', color: '#F7C846' }}>★</span>
                        <span style={{ fontSize: '18px', fontWeight: '600' }}>
                            {service.rating}
                        </span>
                        <span style={{ fontSize: '14px', color: '#666' }}>
                            ({service.reviews})
                        </span>
                    </div>
                </div>

                {/* Provider Blind Badge */}
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                    <ProviderBlindBadge variant="default" />
                </div>

                {/* What's Included */}
                <div style={{ marginBottom: '24px' }}>
                    <h2
                        style={{
                            fontSize: '20px',
                            fontWeight: '600',
                            marginBottom: '12px',
                            color: '#0E121A',
                        }}
                    >
                        What's included
                    </h2>
                    <div
                        style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '16px',
                            boxShadow: '0 2px 8px rgba(14,18,26,0.06)',
                        }}
                    >
                        {service.included.map((item, index) => (
                            <div
                                key={index}
                                style={{
                                    fontSize: '16px',
                                    color: '#0E121A',
                                    marginBottom: index < service.included.length - 1 ? '12px' : 0,
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '8px',
                                }}
                            >
                                <span style={{ color: '#8AE98D', fontSize: '18px' }}>✓</span>
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Add-ons */}
                <div style={{ marginBottom: '24px' }}>
                    <h2
                        style={{
                            fontSize: '20px',
                            fontWeight: '600',
                            marginBottom: '12px',
                            color: '#0E121A',
                        }}
                    >
                        Add-ons
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {service.addons.map((addon) => (
                            <button
                                key={addon.id}
                                onClick={() => toggleAddon(addon.id)}
                                style={{
                                    backgroundColor: selectedAddons.includes(addon.id)
                                        ? 'rgba(138, 233, 141, 0.1)'
                                        : 'white',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    border: selectedAddons.includes(addon.id)
                                        ? '2px solid #8AE98D'
                                        : '1px solid #E0E0E0',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 1px 4px rgba(14,18,26,0.05)',
                                }}
                            >
                                <span style={{ fontSize: '16px', color: '#0E121A' }}>
                                    {addon.name}
                                </span>
                                <span style={{ fontSize: '16px', fontWeight: '600', color: '#0E121A' }}>
                                    +₹{addon.price}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating CTA */}
            <FloatingCta
                label="Book Now"
                onClick={() => router.push(`/book/${service.id}`)}
                icon="➕"
                position="bottom-right"
            />
        </div>
    );
}
