import React from 'react';
import { Button } from './Button';

interface LandingProps {
  onStart: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="px-6 py-4 flex justify-between items-center border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-50">
        <button className="flex items-center gap-2">
            <span className="text-3xl">🏡</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tighter">thelocals.co</span>
        </button>
        <button className="text-sm font-medium text-slate-600 hover:text-brand-600">Login</button>
      </header>

      <main className="flex-1 flex flex-col items-center text-center px-6 pt-12 md:pt-20 pb-10 max-w-4xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wide mb-6">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
          Now onboarding in Mumbai
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
          Turn your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">skills</span> into <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">income</span>.
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
          Join 5,000+ local providers earning on their own terms. Flexible timings, instant payouts, and zero hidden fees.
        </p>

        <Button onClick={onStart} className="text-lg px-8 py-4 w-full md:w-auto shadow-xl shadow-brand-500/20 transform hover:-translate-y-1 transition-transform">
          Register as a Provider
        </Button>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {[
            { title: "Zero Commission", desc: "Keep 100% of what you earn for the first month.", icon: "💰" },
            { title: "Flexible Hours", desc: "Work when you want. You are your own boss.", icon: "⏰" },
            { title: "Instant Verification", desc: "AI-powered KYC gets you started in minutes.", icon: "⚡" },
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-left hover:bg-white hover:shadow-lg transition-all">
              <div className="text-3xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-6 text-center text-slate-400 text-sm border-t border-slate-100">
        © 2024 TheLocals. All rights reserved.
      </footer>
    </div>
  );
};
