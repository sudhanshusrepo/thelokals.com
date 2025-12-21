'use client';

import React from 'react';
import { AppBar } from '../components/home/AppBar';
import { HeroSection } from '../components/home/HeroSection';
import { QuickCategories } from '../components/home/QuickCategories';
import { WhyLokals } from '../components/home/WhyLokals';
import { BrowseServices } from '../components/home/BrowseServices';
import { ContactSection } from '../components/home/ContactSection';
import { Footer } from '../components/home/Footer';

export default function Home() {
  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    // TODO: Navigate to search results or show service selection
  };

  const handleSelectCategory = (categoryId: string) => {
    console.log('Selected category:', categoryId);
    // TODO: Navigate to category page
  };

  const handleSelectService = (serviceId: string) => {
    console.log('Selected service:', serviceId);
    // TODO: Navigate to service details
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 1. App Bar */}
      <AppBar
        onSignIn={() => console.log('Sign in clicked')}
        onOpenApp={() => console.log('Open app clicked')}
      />

      {/* 2. Hero with AI Search */}
      <HeroSection onSearch={handleSearch} />

      {/* 3. Quick Categories Carousel */}
      <QuickCategories onSelectCategory={handleSelectCategory} />

      {/* 4. Why Lokals Trust Band */}
      <WhyLokals />

      {/* 5. Browse Services Grid */}
      <BrowseServices onSelectService={handleSelectService} />

      {/* 6. Contact Section */}
      <ContactSection />

      {/* 7. Footer */}
      <Footer />
    </div>
  );
}
