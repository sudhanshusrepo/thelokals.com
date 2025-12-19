'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ServiceGrid from '../components/ServiceGrid';



export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if tutorial has been seen
    const hasSeenTutorial = localStorage.getItem('has_seen_tutorial');
    if (!hasSeenTutorial) {
      router.push('/tutorial');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 animate-fade-in">
      {/* Header / Location Bar */}
      <div className="bg-white/80 backdrop-blur-md p-4 sticky top-0 z-20 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-500 font-bold tracking-wider uppercase mb-0.5">Current Location</div>
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <span className="text-primary text-lg">📍</span>
              <span>Gurugram, Sector 45</span>
              <span className="text-[10px] text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full font-bold">✓ Serviceable</span>
            </div>
          </div>
          <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md border-2 border-white">
            ME
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search for 'AC Repair' or 'Plumber'"
            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4">
        {/* Banner Section */}
        <div className="mt-6 transform hover:scale-[1.02] transition-transform duration-300">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] animate-shimmer rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-extrabold text-2xl mb-1">Detailed Cleaning?</h3>
              <p className="text-blue-100 mb-4 text-sm font-medium">Get 20% off on your first deep clean service.</p>
              <button className="bg-white text-indigo-600 text-xs font-bold py-2.5 px-5 rounded-lg shadow-sm hover:shadow-md hover:bg-slate-50 transition-all active:scale-95">
                Book Now
              </button>
            </div>
            {/* Decorative circles */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          </div>
        </div>

        {/* Services Section */}
        <div className="mt-8">
          <div className="flex justify-between items-end mb-4">
            <h2 className="font-bold text-xl text-slate-900">Our Services</h2>
            <span className="text-xs text-indigo-600 font-bold cursor-pointer hover:underline">View All</span>
          </div>

          {/* Nearby Providers (Bible 6.2) */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm text-slate-700 uppercase tracking-wider">Nearby Providers</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {/* Mock Data for MVP Phase 5 */}
              {[
                { name: "Rajesh Kumar", role: "Plumber", rating: "4.9", jobs: "340", dist: "14 min", color: "bg-blue-100 text-blue-700" },
                { name: "Suresh Electric", role: "Electrician", rating: "4.8", jobs: "120", dist: "8 min", color: "bg-amber-100 text-amber-700" },
                { name: "Amit AC Repair", role: "Technician", rating: "4.7", jobs: "89", dist: "22 min", color: "bg-cyan-100 text-cyan-700" },
              ].map((p, i) => (
                <div key={i} className="min-w-[200px] bg-white rounded-xl p-4 shadow-sm border border-slate-100 snap-center hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full ${p.color} flex items-center justify-center font-bold text-lg`}>
                      {p.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm truncate w-24">{p.name}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{p.role}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1 font-bold text-slate-700">
                      <span className="text-amber-400">★</span> {p.rating} <span className="text-slate-400 font-normal">({p.jobs})</span>
                    </div>
                    <div className="bg-slate-100 px-2 py-1 rounded-md font-medium text-slate-600">
                      ⏱ {p.dist}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Offers Section (Bible 6.2) */}
          <div className="mb-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-5 text-white relative overflow-hidden shadow-lg shadow-pink-200">
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg mb-1">Refer & Earn ₹100</h3>
                <p className="text-pink-100 text-xs mb-3 max-w-[200px]">Invite your neighbors to TheLokals and get free service credits.</p>
                <div className="bg-white/20 backdrop-blur-sm inline-block px-3 py-1 rounded-lg text-xs font-mono border border-white/30">
                  CODE: LOKAL2025
                </div>
              </div>
              <div className="text-4xl">🎁</div>
            </div>
            <div className="absolute -right-4 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>
          <ServiceGrid />
        </div>
      </main>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 py-3 px-6 flex justify-between items-center text-xs font-medium text-slate-500 pb-safe">
        <div className="flex flex-col items-center text-indigo-600 cursor-pointer">
          <span className="text-2xl mb-1">🏠</span>
          <span>Home</span>
        </div>
        <div className="flex flex-col items-center hover:text-slate-900 transition-colors cursor-pointer">
          <span className="text-2xl mb-1 opacity-70">📅</span>
          <span>Bookings</span>
        </div>
        <div className="flex flex-col items-center hover:text-slate-900 transition-colors cursor-pointer">
          <span className="text-2xl mb-1 opacity-70">👤</span>
          <span>Profile</span>
        </div>
      </div>
    </div>
  );
}
