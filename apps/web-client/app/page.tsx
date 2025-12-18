'use client';

import ServiceGrid from '../components/ServiceGrid';

export const runtime = 'edge';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header / Location Bar */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 font-medium">LOCATION</div>
            <div className="flex items-center gap-1 font-bold text-gray-800">
              <span>📍 Gurugram, Sector 45</span>
              <span className="text-xs text-green-600 bg-green-50 px-1 rounded">✓ Serviceable</span>
            </div>
          </div>
          <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
            ME
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search for 'AC Repair' or 'Plumber'"
            className="w-full bg-gray-100 border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-md mx-auto">
        {/* Banner Section */}
        <div className="px-4 mt-6">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-5 text-white shadow-lg shadow-indigo-200">
            <h3 className="font-bold text-lg">Detailed Cleaning?</h3>
            <p className="text-sm opacity-90 mt-1">Get 20% off on your first deep clean service.</p>
            <div className="mt-4 inline-block bg-white text-indigo-600 text-xs font-bold py-2 px-4 rounded-lg cursor-pointer hover:bg-opacity-90 transition">
              Book Now
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center px-4 mb-4">
            <h2 className="font-bold text-lg text-gray-900">Our Services</h2>
            <span className="text-xs text-indigo-600 font-medium cursor-pointer">View All</span>
          </div>
          <ServiceGrid />
        </div>
      </main>

      {/* Bottom Nav Placeholder */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-2 px-6 flex justify-between items-center text-xs text-gray-500">
        <div className="flex flex-col items-center text-indigo-600">
          <span className="text-xl">🏠</span>
          <span className="mt-1 font-medium">Home</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xl">📅</span>
          <span className="mt-1">Bookings</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xl">👤</span>
          <span className="mt-1">Profile</span>
        </div>
      </div>
    </div>
  );
}
