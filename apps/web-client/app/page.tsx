'use client';

export const runtime = 'nodejs';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AppBar } from '../components/home/AppBar';
import { HeroSection } from '../components/home/HeroSection';
import { QuickCategories } from '../components/home/QuickCategories';
import { LazyWhyLokals, LazyBrowseServices, LazyFooter } from '../components/LazyComponents';
import { searchServices } from '../lib/searchServices';

export default function Home() {
  const router = useRouter();

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
