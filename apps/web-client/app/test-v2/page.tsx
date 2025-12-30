/**
 * V2 Component Test Page
 * Test all v2 components in isolation
 */

'use client';

import React from 'react';
import {
    HeroCard,
    ServiceCard,
    StatusCard,
    FloatingCta,
    ProviderBlindBadge,
} from '@/components/v2';

export default function TestV2Page() {
    return (
        <div style={{ padding: '2rem', background: '#F0F0F0', minHeight: '100vh' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '2rem' }}>
                V2 Component Library Test
            </h1>

            {/* HeroCard Tests */}
            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '1rem' }}>
                    HeroCard Component
                </h2>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <HeroCard
                        title="Welcome back!"
                        subtitle="Book your next service with lokals"
                        cta1={{ label: 'Book Service', onClick: () => alert('Book Service'), variant: 'primary' }}
                        cta2={{ label: 'My Plan', onClick: () => alert('My Plan'), variant: 'secondary' }}
                        variant="gradient"
                    />
                    <HeroCard
                        title="Dark Variant"
                        subtitle="Testing dark background"
                        cta1={{ label: 'Action', onClick: () => { }, variant: 'primary' }}
                        variant="dark"
                    />
                </div>
            </section>

            {/* ServiceCard Tests */}
            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '1rem' }}>
                    ServiceCard Component
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                    <ServiceCard
                        service={{
                            id: '1',
                            name: 'AC Repair & Service',
                            image: '/placeholder-service.jpg',
                            price: 499,
                            rating: 4.9,
                            reviews: 234,
                            isBestMatch: true,
                        }}
                        onClick={(id) => alert(`Clicked service ${id}`)}
                    />
                    <ServiceCard
                        service={{
                            id: '2',
                            name: 'Home Cleaning',
                            image: '/placeholder-service.jpg',
                            price: 799,
                            rating: 4.7,
                            reviews: 156,
                        }}
                        onClick={(id) => alert(`Clicked service ${id}`)}
                    />
                    <ServiceCard
                        service={{
                            id: '3',
                            name: 'Plumbing Services',
                            image: '/placeholder-service.jpg',
                            price: 599,
                            rating: 4.8,
                            reviews: 89,
                        }}
                        onClick={(id) => alert(`Clicked service ${id}`)}
                    />
                </div>
            </section>

            {/* StatusCard Tests */}
            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '1rem' }}>
                    StatusCard Component
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <StatusCard
                        status="requested"
                        serviceName="AC Repair & Service"
                        bookingDate="Dec 31, 2025"
                        bookingTime="10:00 AM"
                    />
                    <StatusCard
                        status="assigned"
                        serviceName="Home Cleaning"
                        bookingDate="Dec 31, 2025"
                        bookingTime="2:00 PM"
                        providerName="Best provider assigned"
                    />
                    <StatusCard
                        status="on-the-way"
                        serviceName="Plumbing Services"
                        bookingDate="Dec 30, 2025"
                        bookingTime="4:00 PM"
                        providerName="Best provider assigned"
                        estimatedArrival="15 minutes"
                    />
                    <StatusCard
                        status="in-progress"
                        serviceName="Electrician"
                        bookingDate="Dec 30, 2025"
                        bookingTime="11:00 AM"
                        providerName="Best provider assigned"
                    />
                    <StatusCard
                        status="completed"
                        serviceName="Beauty Services"
                        bookingDate="Dec 29, 2025"
                        bookingTime="3:00 PM"
                        providerName="Best provider assigned"
                    />
                </div>
            </section>

            {/* ProviderBlindBadge Tests */}
            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '1rem' }}>
                    ProviderBlindBadge Component
                </h2>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <ProviderBlindBadge variant="default" />
                    <ProviderBlindBadge variant="compact" />
                </div>
            </section>

            {/* FloatingCta Test */}
            <FloatingCta
                label="Book Now"
                onClick={() => alert('FloatingCta clicked!')}
                position="bottom-right"
            />
        </div>
    );
}
