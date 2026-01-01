/**
 * Services List Page - V2 Design
 * Discovery screen with search, filters, and service cards
 */

'use client';

import React, { useState, useMemo } from 'react';
import { ServiceCard } from '@/components/v2';
import { useV2Design } from '@/lib/feature-flags';

// Mock service data (replace with API call)
const MOCK_SERVICES = [
    {
        id: '1',
        name: 'Deep Cleaning Service',
        price: 499,
        rating: 4.9,
        reviews: 127,
        image: '/services/cleaning.webp',
        category: 'cleaning',
        isBestMatch: true,
    },
    {
        id: '2',
        name: 'Plumbing Repair',
        price: 299,
        rating: 4.8,
        reviews: 89,
        image: '/services/plumbing.webp',
        category: 'repairs',
    },
    {
        id: '3',
        name: 'Electrical Fix',
        price: 399,
        rating: 4.7,
        reviews: 156,
        image: '/services/electrician.webp',
        category: 'repairs',
    },
    {
        id: '4',
        name: 'Salon at Home',
        price: 599,
        rating: 4.9,
        reviews: 234,
        image: '/services/beauty.webp',
        category: 'beauty',
    },
    {
        id: '5',
        name: 'AC Repair & Service',
        price: 699,
        rating: 4.8,
        reviews: 178,
        image: '/services/ac-repair.webp',
        category: 'appliances',
        isBestMatch: true,
    },
    {
        id: '6',
        name: 'Home Painting',
        price: 899,
        rating: 4.6,
        reviews: 92,
        image: '/services/painting.webp',
        category: 'repairs',
    },
];

const CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: 'cleaning', label: 'Cleaning' },
    { id: 'repairs', label: 'Repairs' },
    { id: 'beauty', label: 'Beauty' },
    { id: 'appliances', label: 'Appliances' },
];

export default function ServicesPage() {
    const showV2 = useV2Design();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Filter services based on search and category
    const filteredServices = useMemo(() => {
        return MOCK_SERVICES.filter((service) => {
            const matchesSearch = service.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            const matchesCategory =
                selectedCategory === 'all' || service.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, selectedCategory]);

    if (!showV2) {
        // Fallback to existing services page
        return <div>Loading services...</div>;
    }

    // Simulate loading state (for demo purposes)
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#F0F0F0', padding: '100px 16px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
                    {[...Array(8)].map((_, i) => (
                        <div key={i} style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', height: '220px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <div className="skeleton-loader" style={{ height: '120px', backgroundColor: '#EEE' }} />
                            <div style={{ padding: '16px' }}>
                                <div className="skeleton-loader" style={{ height: '20px', width: '80%', backgroundColor: '#EEE', borderRadius: '4px', marginBottom: '8px' }} />
                                <div className="skeleton-loader" style={{ height: '16px', width: '40%', backgroundColor: '#EEE', borderRadius: '4px' }} />
                            </div>
                            <style jsx>{`
                                .skeleton-loader {
                                    position: relative;
                                    overflow: hidden;
                                }
                                .skeleton-loader::after {
                                    content: '';
                                    position: absolute;
                                    top: 0; left: 0; right: 0; bottom: 0;
                                    transform: translateX(-100%);
                                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                                    animation: shimmer 1.5s infinite;
                                }
                                @keyframes shimmer {
                                    100% { transform: translateX(100%); }
                                }
                            `}</style>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F0F0F0' }}>
            {/* Sticky Search + Filter Bar */}
            <div
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    backgroundColor: '#F0F0F0',
                    paddingTop: '80px', // AppBar height
                    paddingBottom: '16px',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                }}
            >
                {/* Search Bar */}
                <div style={{ marginBottom: '12px', position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Search services..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 48px 12px 16px',
                            fontSize: '16px',
                            borderRadius: '12px',
                            border: 'none',
                            backgroundColor: 'white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            outline: 'none',
                        }}
                    />
                    <span
                        style={{
                            position: 'absolute',
                            right: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '20px',
                        }}
                    >
                        🔍
                    </span>
                </div>

                {/* Category Chips */}
                <div
                    style={{
                        display: 'flex',
                        gap: '12px',
                        overflowX: 'auto',
                        paddingBottom: '4px',
                    }}
                    className="scrollbar-hide"
                >
                    {CATEGORIES.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: 'none',
                                fontSize: '14px',
                                fontWeight: selectedCategory === category.id ? '600' : '500',
                                backgroundColor:
                                    selectedCategory === category.id ? '#F7C846' : 'white',
                                color: selectedCategory === category.id ? '#0E121A' : '#666',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Services Grid */}
            <div
                style={{
                    padding: '20px 16px 100px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: '16px',
                    maxWidth: '1200px',
                    margin: '0 auto',
                }}
            >
                {filteredServices.length > 0 ? (
                    filteredServices.map((service) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            onClick={(id) => {
                                window.location.href = `/services/${id}`;
                            }}
                        />
                    ))
                ) : (
                    <div
                        style={{
                            gridColumn: '1 / -1',
                            textAlign: 'center',
                            padding: '40px 20px',
                        }}
                    >
                        <p style={{ fontSize: '18px', color: '#666' }}>
                            No services found matching your criteria
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
