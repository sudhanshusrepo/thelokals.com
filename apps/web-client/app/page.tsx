'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
// import Tilt from 'react-parallax-tilt'; // Keeping it simple for now, can uncomment if installed and needed
import { SERVICE_GROUPS, ONLINE_SERVICE_GROUPS } from '../constants';

import { Features } from '../components/Features';
import { StickyChatCta } from '../components/StickyChatCta';

import { useGeolocation } from '../hooks/useGeolocation';
import { isLocationInBetaArea, BETA_OFFER_DETAILS } from '../utils/offerUtils';

const OfferBanner: React.FC = () => {
  const { location } = useGeolocation();
  const isBetaUser = isLocationInBetaArea(location);

  if (isBetaUser) {
    return (
      <div className={`
                relative overflow-hidden
                bg-gradient-to-r ${BETA_OFFER_DETAILS.color}
                text-white p-4 sm:p-6 mb-8 rounded-2xl shadow-lg shadow-pink-500/20
                transform hover:scale-[1.02] transition-transform duration-300
                animate-fade-in
                border-2 animate-flash-border
            `}>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>

        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{BETA_OFFER_DETAILS.icon}</span>
              <p className="font-bold text-lg sm:text-xl">{BETA_OFFER_DETAILS.title}</p>
            </div>
            <p className="text-sm sm:text-base text-pink-50 opacity-90 mb-1">{BETA_OFFER_DETAILS.description}</p>
            <p className="text-xs bg-white/20 inline-block px-2 py-1 rounded font-mono">
              Code: <span className="font-bold">{BETA_OFFER_DETAILS.code}</span>
            </p>
          </div>
          <div className="hidden sm:block text-4xl animate-pulse">🎁</div>
        </div>
      </div>
    );
  }

  // Default Offer
  return (
    <div className="
            relative overflow-hidden
            bg-gradient-to-r from-emerald-500 to-teal-600 
            text-white p-4 sm:p-6 mb-8 rounded-2xl shadow-lg shadow-emerald-500/20
            transform hover:scale-[1.02] transition-transform duration-300
            border-2 animate-flash-border
        ">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>

      <div className="relative flex items-center justify-between">
        <div>
          <p className="font-bold text-lg sm:text-xl mb-1">🎉 20% OFF Cleaning Services!</p>
          <p className="text-sm sm:text-base text-emerald-50 opacity-90">Use code <span className="font-mono bg-white/20 px-2 py-0.5 rounded font-bold text-white">CLEAN20</span> at checkout</p>
        </div>
        <div className="hidden sm:block text-4xl animate-bounce">✨</div>
      </div>
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'offline' | 'online'>('offline');

  const currentGroups = activeTab === 'offline' ? SERVICE_GROUPS : ONLINE_SERVICE_GROUPS;

  return (
    <div className="space-y-6 animate-fade-in-up min-h-screen pb-20">
      {/* Tab Switcher */}
      <div className="flex justify-center pt-8">
        <div
          className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl inline-flex shadow-inner"
          role="tablist"
          aria-label="Service Type Selection"
        >
          <button
            role="tab"
            aria-selected={activeTab === 'offline'}
            aria-controls="offline-services-panel"
            id="tab-offline"
            onClick={() => setActiveTab('offline')}
            className={`
                            px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200
                            ${activeTab === 'offline'
                ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}
                        `}
          >
            At-Home Services
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'online'}
            aria-controls="online-services-panel"
            id="tab-online"
            onClick={() => setActiveTab('online')}
            className={`
                            px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200
                            ${activeTab === 'online'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}
                        `}
          >
            Online Experts
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="text-center px-4 max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
          {activeTab === 'offline' ? (
            <>All Types of Local Services <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">Near You</span></>
          ) : (
            <>Expert Online Services <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">& Professionals</span></>
          )}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
          {activeTab === 'offline'
            ? "From home cleaning to appliance repair, find trusted local helpers in your neighborhood."
            : "Connect with top-rated freelancers and experts for digital, creative, and business needs."}
        </p>
      </div>

      {/* Service Groups Grid */}
      <div
        className="w-full px-4 max-w-7xl mx-auto"
        role="tabpanel"
        id={`${activeTab}-services-panel`}
        aria-labelledby={`tab-${activeTab}`}
      >
        <h2 className="sr-only">
          {activeTab === 'offline' ? 'At-Home Services' : 'Online Experts'}
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {Object.values(currentGroups).map((group) => (
            <motion.button
              key={group.name}
              data-testid="category-card"
              onClick={() => router.push(`/group/${encodeURIComponent(group.name)}`)}
              whileHover={{
                scale: 1.05,
                y: -8,
                rotateX: 5,
                rotateY: 5,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`
                                relative flex flex-col items-center p-3 sm:p-6
                                bg-white dark:bg-slate-800
                                rounded-xl sm:rounded-2xl
                                shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]
                                hover:shadow-[0_20px_30px_-10px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_30px_-10px_rgba(0,0,0,0.4)]
                                border border-slate-100 dark:border-slate-700
                                hover:border-${activeTab === 'offline' ? 'teal' : 'indigo'}-500/50 dark:hover:border-${activeTab === 'offline' ? 'teal' : 'indigo'}-400/50
                                group overflow-hidden
                                min-h-[120px] sm:min-h-[160px] justify-center
                                transform-gpu perspective-1000
                            `}
            >
              {/* Background Gradient Hover Effect */}
              <div className={`
                                absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                                bg-gradient-to-br from-${group.color}-50/50 to-transparent dark:from-${group.color}-900/10
                            `}></div>

              {/* Icon Container */}
              <div className={`
                                relative z-10
                                w-14 h-14 sm:w-16 sm:h-16 rounded-full 
                                flex items-center justify-center 
                                text-3xl sm:text-4xl mb-3 sm:mb-4
                                bg-${group.color}-50 dark:bg-${group.color}-900/20 
                                text-${group.color}-600 dark:text-${group.color}-400
                                group-hover:scale-110 group-hover:rotate-3 
                                transition-all duration-300 ease-out
                                shadow-sm group-hover:shadow-md
                            `}>
                {group.icon}
              </div>

              {/* Text Content */}
              <div className="relative z-10 text-center w-full">
                <h3 className={`text-[11px] sm:text-sm font-bold text-slate-900 dark:text-white mb-0 sm:mb-1 group-hover:text-${activeTab === 'offline' ? 'teal' : 'indigo'}-600 dark:group-hover:text-${activeTab === 'offline' ? 'teal' : 'indigo'}-400 transition-colors leading-tight px-0.5 break-words`}>
                  {group.name}
                </h3>
                <p className="hidden sm:block text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 px-1 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                  {group.helperText}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="py-8 px-4 max-w-7xl mx-auto">
        {activeTab === 'offline' && <OfferBanner />}
        <Features />
      </div>

      <StickyChatCta />
    </div>
  );
};
