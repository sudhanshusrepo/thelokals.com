'use client';

import ServiceGrid from '../components/ServiceGrid';

export const runtime = 'edge';

export default function Home() {
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
