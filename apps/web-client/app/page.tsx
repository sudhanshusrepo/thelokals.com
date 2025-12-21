'use client';

import React from 'react';
import { AppBar } from '../components/landing/AppBar';
import { HeroSection } from '../components/landing/HeroSection';
import { CategoryCarousel } from '../components/landing/CategoryCarousel';
import { BenefitsSection } from '../components/landing/BenefitsSection';
import { CookieBanner } from '../components/landing/CookieBanner';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleSearch = (query: string) => {
    // Simple mock routing for prototype/E2E
    // In real app, this would go to /search?q=...
    // But since we want to hit the Service Detail for "Leak Repair":
    if (query.toLowerCase().includes('leak')) {
      router.push('/service/leak-repair');
    } else {
      // Fallback or search page
      router.push(`/service/${query.toLowerCase().replace(/\s+/g, '-')}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] relative pb-20 font-sans">
      {/* 1. App Bar */}
      <AppBar
        onSecondaryAction={() => console.log('Plans clicked')}
        onPrimaryAction={() => console.log('Launch App clicked')}
      />

      {/* 2. Hero Section (Includes Search Bar) */}
      <HeroSection onSearch={handleSearch} />

      {/* 3. Category Carousel */}
      <div className="mt-8">
        <CategoryCarousel />
      </div>

      {/* 4. Benefits Section */}
      <BenefitsSection />

      {/* 5. Cookie Consent */}
      <CookieBanner />
    </div>
  );
}
