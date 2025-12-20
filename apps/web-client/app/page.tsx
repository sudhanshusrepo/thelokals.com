'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ServiceGrid from '../components/ServiceGrid';
import { ChatInput } from '../components/ChatInput';
import { AIAnalysisOverlay } from '../components/AIAnalysisOverlay';
import { Features } from '../components/Features';

export default function Home() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Check if tutorial has been seen
    const hasSeenTutorial = localStorage.getItem('has_seen_tutorial');
    if (!hasSeenTutorial) {
      router.push('/tutorial');
    }
  }, [router]);

  const steps = [
    "Analyzing your request...",
    "Identifying service category...",
    "Checking provider availability...",
    "Calculating estimated costs...",
    "Curating the best matches..."
  ];

  const handleInputSend = async (content: { type: 'text' | 'audio' | 'video', data: string | Blob }) => {
    setIsProcessing(true);
    setIsComplete(false);
    setProgressStep(0);

    // Simulate AI Analysis
    try {
      for (let i = 0; i < steps.length; i++) {
        setProgressStep(i);
        await new Promise(r => setTimeout(r, 600)); // Slightly faster for Hero interaction
      }

      setIsComplete(true);

      // Navigate after success
      setTimeout(() => {
        setIsProcessing(false);
        const textData = content.type === 'text' ? content.data : "Media Request";
        router.push(`/service/other?userInput=${encodeURIComponent(textData as string)}`);
      }, 1000);

    } catch (error) {
      console.error("Error in AI flow:", error);
      setIsProcessing(false);
    }
  };

  const handleCloseOverlay = () => {
    setIsProcessing(false);
    setIsComplete(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 animate-fade-in font-sans">
      <AIAnalysisOverlay
        isVisible={isProcessing}
        step={progressStep}
        steps={steps}
        onClose={handleCloseOverlay}
        isComplete={isComplete}
      />

      {/* Header / Location Bar */}
      <div className="bg-white/80 backdrop-blur-md p-4 sticky top-0 z-30 border-b border-slate-100 transition-all duration-300">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div>
            <div className="text-[10px] text-slate-500 font-bold tracking-wider uppercase mb-0.5">Current Location</div>
            <div className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer hover:bg-slate-50 p-1 rounded-lg -ml-1 transition-colors">
              <span className="text-indigo-600 text-lg">📍</span>
              <span className="text-base sm:text-lg">Gurugram, Sector 45</span>
              <span className="hidden xs:inline-block text-[10px] text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full font-bold">✓ Serviceable</span>
            </div>
          </div>
          <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md border-2 border-white ring-2 ring-indigo-50 cursor-pointer hover:scale-105 transition-transform">
            ME
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto px-4 pt-6 space-y-8">

        {/* HERO: TheLokals AI Chat Interface */}
        <section className="relative">
          {/* Decorative background for Hero */}
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 via-indigo-500 to-purple-600 rounded-3xl blur opacity-30"></div>

          <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            <div className="bg-gradient-to-r from-slate-50 to-white px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600">
                  TheLokals AI
                </span>
              </div>
              <div className="text-[10px] font-medium text-slate-400">
                Voice & Video Enabled
              </div>
            </div>

            <div className="p-1">
              <ChatInput
                onSend={handleInputSend}
                isLoading={isProcessing}
                className="!relative !bottom-auto !left-auto !right-auto !bg-transparent !border-0 !shadow-none !p-2"
                placeholder="Ask anything... e.g., 'Book a deep cleaning for tomorrow'"
              />
            </div>
          </div>
          {/* Quick suggestions */}
          <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {["AC Repair", "Home Cleaning", "Plumber", "Electrician"].map((tag, i) => (
              <button
                key={i}
                onClick={() => handleInputSend({ type: 'text', data: tag })}
                className="whitespace-nowrap px-3 py-1.5 bg-white border border-slate-100 rounded-full text-xs font-medium text-slate-600 shadow-sm hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all"
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        {/* Promotional Banner */}
        <div className="transform hover:scale-[1.02] transition-transform duration-300">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] animate-shimmer rounded-2xl p-6 text-white shadow-xl shadow-indigo-200/50 relative overflow-hidden">
            <div className="relative z-10 max-w-[70%]">
              <h3 className="font-extrabold text-2xl mb-1 leading-tight">Detailed Cleaning?</h3>
              <p className="text-indigo-100 mb-4 text-xs font-medium leading-relaxed opacity-90">Get 20% off on your first deep clean service.</p>
              <button className="bg-white text-indigo-600 text-xs font-bold py-2.5 px-5 rounded-lg shadow-sm hover:shadow-md hover:bg-slate-50 transition-all active:scale-95">
                Book Now
              </button>
            </div>
            {/* Decorative circles */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2 text-6xl opacity-20 rotate-12">
              ✨
            </div>
          </div>
        </div>

        {/* Categories / Services */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="font-bold text-xl text-slate-900">Our Services</h2>
            <button className="text-xs text-indigo-600 font-bold hover:underline">View All</button>
          </div>
          <ServiceGrid />
        </section>

        {/* Nearby Providers */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm text-slate-700 uppercase tracking-wider">Nearby Providers</h3>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide snap-x">
            {/* Mock Data */}
            {[
              { name: "Rajesh Kumar", role: "Plumber", rating: "4.9", jobs: "340", dist: "14 min", color: "bg-blue-100 text-blue-700", verified: true },
              { name: "Suresh Electric", role: "Electrician", rating: "4.8", jobs: "120", dist: "8 min", color: "bg-amber-100 text-amber-700", verified: true },
              { name: "Amit AC Repair", role: "Technician", rating: "4.7", jobs: "89", dist: "22 min", color: "bg-cyan-100 text-cyan-700", verified: false },
              { name: "Priya Cleaning", role: "Cleaner", rating: "5.0", jobs: "210", dist: "11 min", color: "bg-purple-100 text-purple-700", verified: true },
            ].map((p, i) => (
              <div key={i} className="min-w-[210px] bg-white rounded-2xl p-4 shadow-sm border border-slate-100 snap-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-full ${p.color} flex items-center justify-center font-bold text-xl relative`}>
                    {p.name[0]}
                    {p.verified && <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5"><div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[8px] text-white">✓</div></div>}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm truncate w-24">{p.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{p.role}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-slate-50 pt-3">
                  <div className="flex items-center gap-1 font-bold text-slate-700">
                    <span className="text-amber-400">★</span> {p.rating} <span className="text-slate-400 font-normal">({p.jobs})</span>
                  </div>
                  <div className="bg-slate-100 px-2.5 py-1 rounded-full font-medium text-slate-600 flex items-center gap-1">
                    <span>⚡</span> {p.dist}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Offers Section */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-pink-200 hover:shadow-pink-300 transition-shadow">
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-xl mb-1">Refer & Earn ₹100</h3>
              <p className="text-pink-100 text-xs mb-4 max-w-[200px] leading-relaxed">Invite your neighbors to TheLokals and get free service credits on your next booking.</p>
              <button
                onClick={() => { navigator.clipboard.writeText('LOKAL2025'); alert('Code Copied!') }}
                className="bg-white/20 backdrop-blur-sm inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono border border-white/30 hover:bg-white/30 transition-colors cursor-pointer active:scale-95"
              >
                <span>CODE: LOKAL2025</span>
                <span className="opacity-70">📋</span>
              </button>
            </div>
            <div className="text-6xl animate-bounce-small">🎁</div>
          </div>
          <div className="absolute -right-4 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/10 to-transparent"></div>
        </div>

        {/* Features / Why Choose Us */}
        <Features />

      </main>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 py-3 px-6 flex justify-between items-center text-xs font-medium text-slate-500 pb-safe z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col items-center text-indigo-600 cursor-pointer transform scale-105">
          <span className="text-2xl mb-1 drop-shadow-sm">🏠</span>
          <span className="font-bold">Home</span>
        </div>
        <div className="flex flex-col items-center hover:text-slate-900 transition-colors cursor-pointer group">
          <span className="text-2xl mb-1 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all">📅</span>
          <span>Bookings</span>
        </div>
        <div className="flex flex-col items-center hover:text-slate-900 transition-colors cursor-pointer group">
          <span className="text-2xl mb-1 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all">👤</span>
          <span>Profile</span>
        </div>
      </div>
    </div>
  );
}
