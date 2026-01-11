'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ShieldCheck, MapPin, Clock } from 'lucide-react';
import { useBookingLogic, PricingUtils } from '@thelocals/flows';
import { bookingService, ServiceCategory, ServiceItem } from '@thelocals/platform-core';
import { useLocation } from '../../contexts/LocationContext';

interface ServiceSelectionProps {
    category: ServiceCategory;
    onContinue: (item: ServiceItem) => void;
}

export default function ServiceSelection({ category, onContinue }: ServiceSelectionProps) {
    const { locationState } = useLocation();
    // Removed local machine, unnecessary here as we lift state up

    const [options, setOptions] = useState<ServiceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    // Fetch Options
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const items = await bookingService.getServiceItems(category.id);
                setOptions(items as ServiceItem[]);
            } catch (err) {
                console.error("Failed to load options", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOptions();
    }, [category.id]);

    const handleSelect = (item: ServiceItem) => {
        setSelectedOption(item.id);
    };

    const activeItem = options.find(o => o.id === selectedOption);
    const estimate = activeItem ? PricingUtils.calculateEstimate(activeItem) : null;

    if (loading) return <div className="p-8 text-center text-gray-500">Loading options...</div>;

    return (
        <div className="max-w-md mx-auto bg-white min-h-screen pb-24">
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 px-4 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{category.name}</h1>
                    <div className="flex items-center text-xs text-gray-500 gap-1 mt-1">
                        <MapPin size={12} />
                        <span className="truncate max-w-[200px]">{locationState.address || 'Location not set'}</span>
                    </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                    {/* Placeholder Icon */}
                    <span className="text-xl">🛠️</span>
                </div>
            </div>

            {/* Options Grid */}
            <div className="p-4 space-y-4">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Select Service Type</h2>

                <div className="grid grid-cols-1 gap-3">
                    {options.map((item) => (
                        <motion.div
                            key={item.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelect(item)}
                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex justify-between items-center ${selectedOption === item.id
                                ? 'border-lokals-green bg-green-50'
                                : 'border-gray-100 hover:border-gray-200'
                                }`}
                        >
                            <div>
                                <h3 className="font-bold text-gray-900 item-name">{item.name}</h3>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{item.description}</p>
                                <div className="mt-2 text-xs font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded inline-block">
                                    {PricingUtils.formatPrice(item.base_price)} • {item.price_unit}
                                </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedOption === item.id ? 'border-lokals-green' : 'border-gray-300'
                                }`}>
                                {selectedOption === item.id && <div className="w-2.5 h-2.5 rounded-full bg-lokals-green" />}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Trust Markers */}
            <div className="px-4 py-6 bg-gray-50 mt-4 mx-4 rounded-xl space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                    <ShieldCheck size={16} className="text-lokals-green" />
                    <span>Verified Professionals</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Clock size={16} className="text-lokals-green" />
                    <span>On-time Guarantee</span>
                </div>
            </div>

            {/* Bottom Sheet Action */}
            {selectedOption && estimate && (
                <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-v2-card"
                >
                    <div className="max-w-md mx-auto">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <p className="text-xs text-gray-500">Estimated Total</p>
                                <p className="text-2xl font-bold text-gray-900">{PricingUtils.formatPrice(estimate.total)}</p>
                                <p className="text-xs text-gray-400">+ Applicable Taxes</p>
                            </div>
                            <button
                                onClick={() => activeItem && onContinue(activeItem)}
                                className="bg-black text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors"
                            >
                                Continue <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
