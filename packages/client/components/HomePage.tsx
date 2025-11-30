import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SERVICE_GROUPS } from '../constants';
import { HowItWorks } from './HowItWorks';
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

export const HomePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-8 animate-fade-in-up pb-24">
            <Helmet>
                <title>thelokals.com - AI-Powered Local Service Booking</title>
                <meta name="description" content="Find and book trusted local professionals instantly with thelokals.com. Our AI-powered platform matches you with top-rated cleaners, plumbers, electricians, and more in your area." />
                <meta name="keywords" content="local services, book cleaners, find plumbers, electrician near me, AI booking, home services, thelokals, trusted professionals, instant booking" />
                <link rel="canonical" href="https://thelokals.com/" />
            </Helmet>

            {/* Hero Section - Compact to focus on services */}
            <div className="text-center py-4 px-4 max-w-3xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                    Your Local Experts, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">Instantly.</span>
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Select a category below or ask our AI
                </p>
            </div>

            {/* Service Groups Grid - 3 columns × 2 rows */}
            <div className="w-full px-2 sm:px-4">
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    {Object.values(SERVICE_GROUPS).slice(0, 6).map((group) => (
                        <motion.button
                            key={group.name}
                            data-testid="category-card"
                            onClick={() => navigate(`/group/${encodeURIComponent(group.name)}`)}
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
                                relative flex flex-col items-center p-2 sm:p-6
                                bg-white dark:bg-slate-800
                                rounded-xl sm:rounded-2xl
                                shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]
                                hover:shadow-[0_20px_30px_-10px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_30px_-10px_rgba(0,0,0,0.4)]
                                border border-slate-100 dark:border-slate-700
                                hover:border-teal-500/50 dark:hover:border-teal-400/50
                                group overflow-hidden
                                min-h-[100px] sm:min-h-[160px] justify-center
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
                                w-10 h-10 sm:w-20 sm:h-20 rounded-full 
                                flex items-center justify-center 
                                text-xl sm:text-4xl mb-2 sm:mb-4 
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
                                <h3 className="text-[10px] sm:text-lg font-bold text-slate-900 dark:text-white mb-0 sm:mb-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-tight px-0.5 break-words">
                                    {group.name}
                                </h3>
                                <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 line-clamp-2 px-1 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                                    {group.helperText}
                                </p>
                            </div>

                            {/* Action Arrow (Visible on Hover - Desktop only) */}
                            <div className="
                                hidden sm:flex
                                absolute bottom-2 right-2 
                                w-6 h-6 rounded-full bg-teal-50 dark:bg-teal-900/30 
                                items-center justify-center text-teal-600 dark:text-teal-400
                                opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 
                                transition-all duration-300 delay-100 text-xs
                            ">
                                →
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>

            <div className="py-8 px-4 max-w-7xl mx-auto">
                <div className="mb-12">
                    <HowItWorks />
                </div>

                <OfferBanner />

                <Features />
            </div>

            <StickyChatCta />
        </div>
    );
};
