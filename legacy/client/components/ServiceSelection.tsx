import React, { useState } from 'react';
import { WorkerCategory, ServiceType } from '@thelocals/core/types';
import { SERVICES_BY_CATEGORY } from '@thelocals/core/constants/services';
import { CATEGORY_DISPLAY_NAMES } from '../constants';
import { useNavigate } from 'react-router-dom';

interface ServiceSelectionProps {
    category: WorkerCategory;
    onBook: (service: ServiceType) => void;
}

export const ServiceSelection: React.FC<ServiceSelectionProps> = ({ category, onBook }) => {
    const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
    const services = SERVICES_BY_CATEGORY[category] || [];
    const navigate = useNavigate();

    return (
        <div className="animate-fade-in pb-24">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <svg className="w-6 h-6 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{CATEGORY_DISPLAY_NAMES[category]} Services</h1>
            </div>

            <div className="grid gap-4">
                {services.length > 0 ? (
                    services.map((service) => (
                        <div
                            key={service.id}
                            onClick={() => setSelectedService(service)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedService?.id === service.id
                                ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                                : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-teal-200'
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{service.name}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{service.description}</p>
                                    <div className="flex items-center gap-4 mt-2 text-sm">
                                        <span className="text-slate-600 dark:text-slate-300 font-medium">₹{service.price}</span>
                                        <span className="text-slate-400">•</span>
                                        <span className="text-slate-600 dark:text-slate-300">{service.duration}</span>
                                    </div>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedService?.id === service.id ? 'border-teal-500' : 'border-slate-300'
                                    }`}>
                                    {selectedService?.id === service.id && (
                                        <div className="w-3 h-3 rounded-full bg-teal-500" />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <p className="text-slate-500">No specific services listed for this category yet.</p>
                        <p className="text-sm text-slate-400 mt-2">Try selecting "General Service" if available.</p>
                    </div>
                )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t dark:border-slate-800 shadow-lg">
                <div className="max-w-7xl mx-auto">
                    <button
                        disabled={!selectedService}
                        onClick={() => selectedService && onBook(selectedService)}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${selectedService
                            ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        {selectedService ? `Book ${selectedService.name} - ₹${selectedService.price}` : 'Select a Service'}
                    </button>
                </div>
            </div>
        </div>
    );
};
