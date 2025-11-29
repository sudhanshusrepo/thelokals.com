import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { SERVICE_GROUPS } from '../constants';
import { HowItWorks } from './HowItWorks';
import { Features } from './Features';
import { CategoryBox3D } from './CategoryBox3D';

const OfferBanner: React.FC = () => (
    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 sm:p-4 mb-4 rounded-md shadow-md">
        <p className="font-bold text-sm sm:text-base">20% off cleaning services!</p>
        <p className="text-xs sm:text-sm">Use code CLEAN20 at checkout.</p>
    </div>
);

const EmergencyBanner: React.FC = () => (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 mb-4 rounded-md shadow-md">
        <p className="font-bold text-sm sm:text-base">Emergency Help Needed?</p>
        <p className="text-xs sm:text-sm">Call our 24/7 hotline at 1-800-123-4567.</p>
    </div>
);

export const HomePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6 animate-fade-in-up">
            <Helmet>
                <title>Thelokals.com - Find and Book Local Services</title>
                <meta name="description" content="Thelokals.com is your one-stop platform to find, book, and manage services from skilled local professionals." />
            </Helmet>

            {/* Service Groups Grid - 3 per row with larger cards */}
            <CategoryBox3D className="mx-2">
                <div className="grid grid-cols-3 gap-4 sm:gap-6">
                    {Object.values(SERVICE_GROUPS).map((group) => (
                        <button
                            key={group.name}
                            onClick={() => navigate(`/group/${encodeURIComponent(group.name)}`)}
                            className="flex flex-col items-center p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 border border-slate-100 dark:border-slate-700 group"
                        >
                            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-3xl sm:text-4xl mb-3 sm:mb-4 bg-${group.color}-100 dark:bg-${group.color}-900/30 group-hover:scale-110 transition-transform`}>
                                {group.icon}
                            </div>
                            <h3 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white mb-1 sm:mb-2 group-hover:text-teal-600 transition-colors text-center leading-tight">
                                {group.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center hidden sm:block line-clamp-2">
                                {group.helperText}
                            </p>
                        </button>
                    ))}
                </div>
            </CategoryBox3D>

            {/* Hero Section - Moved below and made subtle */}
            <div className="text-center py-4 px-4">
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
                    Select a category to get started with our AI-powered booking
                </p>
            </div>

            <div className="py-4 sm:py-8 px-4">
                <HowItWorks />
                <div className="my-6 sm:my-8">
                    <OfferBanner />
                </div>
                <Features />
                <div className="my-6 sm:my-8">
                    <EmergencyBanner />
                </div>
            </div>
        </div>
    );
};
