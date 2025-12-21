'use client';

import React from 'react';
import { AppBar } from '../components/landing/AppBar';
import { HeroSection } from '../components/landing/HeroSection';
import { CategoryCarousel } from '../components/landing/CategoryCarousel';
import { BenefitsSection } from '../components/landing/BenefitsSection';
import { CookieBanner } from '../components/landing/CookieBanner';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F7FB] relative pb-20 font-sans">
      {/* 1. App Bar */}
      <AppBar
        onSecondaryAction={() => console.log('Plans clicked')}
        onPrimaryAction={() => console.log('Launch App clicked')}
      />

      {/* 2. Hero Section (Includes Search Bar) */}
      <HeroSection />

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
