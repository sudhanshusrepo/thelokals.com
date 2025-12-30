'use client';

export const runtime = 'nodejs';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AppBar } from '../components/home/AppBar';
import { HeroSection } from '../components/home/HeroSection';
import { QuickCategories } from '../components/home/QuickCategories';
import { LazyWhyLokals, LazyBrowseServices, LazyFooter } from '../components/LazyComponents';
import { searchServices } from '../lib/searchServices';

// V2 Imports
import { useV2Design } from '../lib/feature-flags';
import { HeroCard } from '../components/v2/HeroCard';
import { ServiceCard } from '../components/v2/ServiceCard';
import { StatusCard } from '../components/v2/StatusCard';
import { designTokensV2 } from '../theme/design-tokens-v2';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const showV2 = useV2Design(user?.id);

  const handleSearch = async (query: string) => {
    if (!query || query.trim().length === 0) return;

    // Search for matching services
    const results = await searchServices(query);

    if (results.length === 1) {
      // Single match - go directly to service page
      router.push(`/services/${results[0].code}`);
    } else if (results.length > 1) {
      // Multiple matches - go to search results
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } else {
      // No matches - still go to search page to show "no results"
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleSelectCategory = (categoryId: string) => {
    router.push(`/services/${categoryId}`);
  };

  const handleSelectService = (serviceId: string) => {
    router.push(`/services/${serviceId}`);
  };

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  const handleOpenApp = () => {
    // PWA install will be implemented here
    console.log('Open app clicked - PWA install prompt');
  };

  // --- V2 RENDER ---
  if (showV2) {
    const quickActions = [
      { id: 'cleaning', label: 'Cleaning', color: '#4CAF50' },
      { id: 'repair', label: 'Repair', color: '#2196F3' },
      { id: 'beauty', label: 'Beauty', color: '#E91E63' },
      { id: 'appliances', label: 'Appliances', color: '#FF9800' },
      { id: 'painting', label: 'Painting', color: '#9C27B0' },
    ];

    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', paddingBottom: '80px' }}>
        {/* V2 Header */}
        <header style={{
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#fff',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eee', overflow: 'hidden' }}>
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" width={40} height={40} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>Current Location</div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>Lokals, Narnaund</div>
            </div>
          </div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            🔔
          </button>
        </header>

        <main style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Hero Card */}
          <section>
            <HeroCard
              title="Welcome to lokals"
              subtitle="Your home services, instantly."
              cta1={{ label: "Book Service", onClick: () => router.push('/services') }}
              variant="gradient"
            />
          </section>

          {/* Quick Actions - Horizontal Scroll */}
          <section>
            <div style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              paddingBottom: '8px',
              scrollbarWidth: 'none'
            }}>
              {quickActions.map(action => (
                <button
                  key={action.id}
                  onClick={() => handleSelectCategory(action.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: 'none',
                    background: '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    whiteSpace: 'nowrap',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </section>

          {/* Next Booking / Status */}
          <section>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', fontFamily: 'Poppins, sans-serif' }}>Upcoming</h3>
            {/* Empty state or StatusCard */}
            {/* Empty state */}
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📅</div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '4px' }}>No active bookings</h3>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>Book your first service today!</p>
              <button
                onClick={() => router.push('/services')}
                style={{
                  background: designTokensV2.colors.gradient.css,
                  border: 'none',
                  padding: '8px 24px',
                  borderRadius: '20px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Book Now
              </button>
            </div>
          </section>

          {/* Popular Services Grid */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>Popular Services</h3>
              <button onClick={() => router.push('/services')} style={{ border: 'none', background: 'none', color: designTokensV2.colors.accent.danger, fontWeight: 600, cursor: 'pointer' }}>See All</button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px'
            }}>
              {/* Mock items for V2 Home */}
              <ServiceCard
                service={{
                  id: 'ac-repair',
                  name: 'AC Repair',
                  image: '/services/ac.jpg', // Placeholder
                  price: 499,
                  rating: 4.8,
                  reviews: 120,
                  isBestMatch: true
                }}
                onClick={handleSelectService}
              />
              <ServiceCard
                service={{
                  id: 'cleaning',
                  name: 'Home Cleaning',
                  image: '/services/cleaning.jpg', // Placeholder
                  price: 899,
                  rating: 4.9,
                  reviews: 85
                }}
                onClick={handleSelectService}
              />
              <ServiceCard
                service={{
                  id: 'plumbing',
                  name: 'Plumbing',
                  image: '/services/plumbing.jpg', // Placeholder
                  price: 299,
                  rating: 4.7,
                  reviews: 45
                }}
                onClick={handleSelectService}
              />
              <ServiceCard
                service={{
                  id: 'salon',
                  name: 'Salon for Women',
                  image: '/services/salon.jpg', // Placeholder
                  price: 1299,
                  rating: 4.9,
                  reviews: 210
                }}
                onClick={handleSelectService}
              />
            </div>
          </section>
        </main>
      </div>
    );
  }

  // --- V1 RENDER (Legacy) ---
  return (
    <div className="min-h-screen bg-background">
      {/* 1. App Bar */}
      <AppBar
        onSignIn={handleSignIn}
        onOpenApp={handleOpenApp}
      />

      {/* 2. Hero with AI Search */}
      <HeroSection onSearch={handleSearch} />

      {/* 3. Quick Categories Carousel */}
      <QuickCategories onSelectCategory={handleSelectCategory} />

      {/* 4. Browse Services Grid - Lazy loaded */}
      <LazyBrowseServices onSelectService={handleSelectService} />

      {/* 5. Why Lokals Trust Band - Lazy loaded */}
      <LazyWhyLokals />

      {/* 6. Footer - Lazy loaded */}
      <LazyFooter />
    </div>
  );
}
