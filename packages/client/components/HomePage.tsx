import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SERVICE_GROUPS, ONLINE_SERVICE_GROUPS } from '../constants';

import { Features } from './Features';
import { StickyChatCta } from './StickyChatCta';

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

            {/* Hero Section */ }
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

    {/* Service Groups Grid */ }
    <div
        className="w-full px-0"
        role="tabpanel"
        id={`${activeTab}-services-panel`}
        aria-labelledby={`tab-${activeTab}`}
    >
        <h2 className="sr-only">
            {activeTab === 'offline' ? 'At-Home Services' : 'Online Experts'}
        </h2>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
            {Object.values(currentGroups).map((group) => (
import Tilt from 'react-parallax-tilt';

            // ... existing imports

            {Object.values(currentGroups).map((group) => (
                <Tilt
                    key={group.name}
                    tiltMaxAngleX={10}
                    tiltMaxAngleY={10}
                    perspective={1000}
                    scale={1.02}
                    transitionSpeed={1500}
                    gyroscope={true}
                    glareEnable={true}
                    glareMaxOpacity={0.3}
                    glareColor={activeTab === 'offline' ? '#0d9488' : '#6366f1'} // teal or indigo glare
                    glarePosition="all"
                    glareBorderRadius="1rem"
                    className="bg-transparent h-full" // Ensure full height for grid
                >
                    <motion.button
                        data-testid="category-card"
                        onClick={() => navigate(`/group/${encodeURIComponent(group.name)}`)}
                        // Removed internal whileHover scale/rotate as Tilt handles it better spatially
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`
                                    w-full h-full
                                    relative flex flex-col items-center p-3 sm:p-6
                                    bg-white dark:bg-slate-800
                                    rounded-xl sm:rounded-2xl
                                    shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]
                                    hover:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.5)]
                                    border border-slate-100 dark:border-slate-700
                                    hover:border-${activeTab === 'offline' ? 'teal' : 'indigo'}-500/30 dark:hover:border-${activeTab === 'offline' ? 'teal' : 'indigo'}-400/30
                                    group overflow-hidden
                                    min-h-[120px] sm:min-h-[180px] justify-center
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
                                    w-14 h-14 sm:w-24 sm:h-24 rounded-full 
                                    flex items-center justify-center 
                                    text-3xl sm:text-5xl mb-3 sm:mb-5 
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
                            <h3 className={`text-[10px] sm:text-lg font-bold text-slate-900 dark:text-white mb-0 sm:mb-1 group-hover:text-${activeTab === 'offline' ? 'teal' : 'indigo'}-600 dark:group-hover:text-${activeTab === 'offline' ? 'teal' : 'indigo'}-400 transition-colors leading-tight px-0.5 break-words`}>
                                {group.name}
                            </h3>
                            <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 line-clamp-2 px-1 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                                {group.helperText}
                            </p>
                        </div>

                        {/* Action Arrow (Visible on Hover - Desktop only) */}
                        <div className={`
                                    hidden sm:flex
                                    absolute bottom-2 right-2 
                                    w-6 h-6 rounded-full bg-${activeTab === 'offline' ? 'teal' : 'indigo'}-50 dark:bg-${activeTab === 'offline' ? 'teal' : 'indigo'}-900/30 
                                    items-center justify-center text-${activeTab === 'offline' ? 'teal' : 'indigo'}-600 dark:text-${activeTab === 'offline' ? 'teal' : 'indigo'}-400
                                    opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 
                                    transition-all duration-300 delay-100 text-xs
                                `}>
                            →
                        </div>
                    </motion.button>
                </Tilt>
            ))}
            ))}
        </div>
    </div>

    {/* SEO Navigation Links (Hidden visually but available for crawlers/sitelinks) */ }
            <nav className="sr-only">
                <a href="/login">Login / Sign up</a>
                <a href="/home-cleaning-maids">Home Cleaning & Maids</a>
                <a href="/cooks-tiffin">Cooks, Tiffin & Catering</a>
                <a href="/electricians-plumbers">Electricians & Plumbers</a>
                <a href="/appliance-repair">Appliance Repairs</a>
                <a href="/tutors-home-tuitions">Tutors & Home Tuitions</a>
                <a href="/car-care">Car Wash & Car Care</a>
                <a href="/salon-at-home">Salon & Grooming at Home</a>
            </nav>

            <div className="py-8 px-4 max-w-7xl mx-auto">
                {activeTab === 'offline' && <OfferBanner />}
                <Features />
            </div>

            <StickyChatCta />
        </div >
    );
};
