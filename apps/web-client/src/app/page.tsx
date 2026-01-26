'use client';

import React, { useEffect, useState } from 'react';
import { adminService } from '@thelocals/platform-core/services/adminService';
import { ServiceCategory } from '@thelocals/platform-core';
import { HeroSection } from '../components/home/HeroSection';
import { ServiceGrid } from '../components/home/ServiceGrid';
import { QuickActions } from '../components/home/QuickActions';

export default function HomePage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminService.getServiceCategories();
        setCategories(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen pb-20">
      {/* Desktop: Container */}
      <div className="max-w-7xl mx-auto md:px-6 md:pt-6 space-y-8">

        <HeroSection />

        <div className="px-4 md:px-0">
          <QuickActions categories={categories} />

          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-text-primary">Recommended for you</h2>
              <button className="text-sm font-bold text-lokals-green hover:underline">See All</button>
            </div>
            <ServiceGrid categories={categories} />
          </div>

          <div className="mb-12">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">Need a vehicle?</h3>
                <p className="text-blue-700 mb-4 text-sm">Rent cars & bikes instantly.</p>
                <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-bold shadow-sm hover:shadow-md transition-shadow text-sm">
                  Browse Rentals
                </button>
              </div>
              <div className="text-4xl">🚗</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
