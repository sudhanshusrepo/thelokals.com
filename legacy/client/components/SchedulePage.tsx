import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SERVICE_TYPES_BY_CATEGORY, CATEGORY_DISPLAY_NAMES, LOWERCASE_TO_WORKER_CATEGORY, ServiceType } from '../constants';

export const SchedulePage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const categorySlug = searchParams.get('category');

    const [selectedService, setSelectedService] = useState<ServiceType | null>(null);

    // Convert category slug to WorkerCategory
    const category = categorySlug ? LOWERCASE_TO_WORKER_CATEGORY[categorySlug.toLowerCase()] : undefined;
    const categoryName = category ? CATEGORY_DISPLAY_NAMES[category] : 'Service';
    const serviceTypes = category ? SERVICE_TYPES_BY_CATEGORY[category] : [];

    const handleServiceSelect = (service: ServiceType) => {
        setSelectedService(service);
        // Navigate to service request page with selected service
        navigate(`/service/${categorySlug}?serviceType=${service.id}`);
    };

    if (!category) {
        return (
            <div className="text-center py-20">
                <div className="text-6xl mb-4">❓</div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Category Not Found
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                    The requested service category doesn't exist.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-colors"
                >
                    Go Home
                </button>
            </div>
        );
    }

    // If no service types defined yet, show coming soon
    if (serviceTypes.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="text-6xl mb-4">🚧</div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Coming Soon
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                    Service types for {categoryName} will be available soon.
                </p>
                <button
                    onClick={() => navigate(`/service/${categorySlug}`)}
                    className="px-6 py-3 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-colors"
                >
                    Continue with General Request
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up" data-testid="schedule-page">
            <Helmet>
                <title>{categoryName} Services - Schedule | Thelokals.com</title>
                <meta
                    name="description"
                    content={`Book ${categoryName} services. Choose from various service types and get instant AI-powered estimates.`}
                />
            </Helmet>

            {/* Service Types Grid - 4 per row */}
            <div className="px-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    {serviceTypes.map((service) => (
                        <button
                            key={service.id}
                            data-testid={`service-type-${service.id}`}
                            onClick={() => handleServiceSelect(service)}
                            className={`
                                relative flex flex-col items-center p-4 sm:p-5 
                                bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20
                                rounded-2xl 
                                shadow-[0_8px_30px_rgb(34,197,94,0.12)] dark:shadow-[0_8px_30px_rgb(34,197,94,0.08)]
                                border-2
                                ${selectedService?.id === service.id
                                    ? 'border-teal-500'
                                    : 'border-green-100/50 dark:border-green-800/30'
                                }
                                backdrop-blur-sm
                                transition-all duration-300 
                                transform hover:-translate-y-2 hover:scale-105 hover:shadow-[0_12px_40px_rgb(34,197,94,0.18)]
                                group
                            `}
                            style={{ transform: 'perspective(1000px) rotateX(0.5deg)' }}
                        >
                            {/* Icon */}
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-3xl sm:text-4xl mb-3 bg-gradient-to-br from-teal-100 to-green-100 dark:from-teal-900/30 dark:to-green-900/30 group-hover:scale-110 transition-transform">
                                {service.icon}
                            </div>

                            {/* Name */}
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-1 text-center leading-tight">
                                {service.name}
                            </h3>

                            {/* Description */}
                            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 text-center mb-2 line-clamp-2 hidden sm:block">
                                {service.description}
                            </p>

                            {/* Price Range */}
                            <div className="mt-auto">
                                <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded-full">
                                    {service.priceRange}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Header Section - Moved below */}
            <div className="text-center py-4">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {categoryName} Services
                </h1>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                    Select the type of service you need
                </p>
            </div>

            {/* Info Section */}
            <div className="px-4 py-6 bg-gradient-to-r from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20 rounded-2xl mx-4">
                <div className="flex items-start gap-3">
                    <div className="text-2xl">💡</div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                            How it works
                        </h3>
                        <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-decimal list-inside">
                            <li>Select a service type above</li>
                            <li>Describe your requirements (text, audio, or video)</li>
                            <li>Get AI-powered checklist and cost estimate</li>
                            <li>Book instantly with verified professionals</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
};
