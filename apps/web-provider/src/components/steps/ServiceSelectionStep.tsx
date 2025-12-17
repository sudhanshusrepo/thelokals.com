import React, { useState } from 'react';
import { ProviderProfile } from '../../types';
import { Button } from '../Button';

interface ServiceSelectionStepProps {
    data: ProviderProfile;
    updateData: (updates: Partial<ProviderProfile>) => void;
    onNext: () => void;
    onBack: () => void;
}

const SERVICE_CATEGORIES = [
    { id: 'plumbing', name: 'Plumbing', icon: '🔧', description: 'Pipe repairs, installations, leak fixes' },
    { id: 'electrical', name: 'Electrical', icon: '⚡', description: 'Wiring, repairs, installations' },
    { id: 'carpentry', name: 'Carpentry', icon: '🪚', description: 'Furniture, repairs, installations' },
    { id: 'painting', name: 'Painting', icon: '🎨', description: 'Interior/exterior painting' },
    { id: 'cleaning', name: 'Cleaning', icon: '🧹', description: 'Home & office cleaning' },
    { id: 'appliance_repair', name: 'Appliance Repair', icon: '🔨', description: 'AC, fridge, washing machine' },
    { id: 'pest_control', name: 'Pest Control', icon: '🐛', description: 'Termite, rodent, insect control' },
    { id: 'gardening', name: 'Gardening', icon: '🌱', description: 'Lawn care, plant maintenance' },
    { id: 'home_renovation', name: 'Home Renovation', icon: '🏗️', description: 'Remodeling, upgrades' },
    { id: 'moving', name: 'Moving & Packing', icon: '📦', description: 'Relocation services' }
];

export const ServiceSelectionStep: React.FC<ServiceSelectionStepProps> = ({
    data,
    updateData,
    onNext,
    onBack
}) => {
    const [selectedServices, setSelectedServices] = useState<string[]>(
        (data as any).selectedServices || []
    );
    const [error, setError] = useState('');

    const toggleService = (serviceId: string) => {
        setSelectedServices(prev => {
            if (prev.includes(serviceId)) {
                return prev.filter(id => id !== serviceId);
            } else {
                return [...prev, serviceId];
            }
        });
        setError('');
    };

    const handleNext = () => {
        if (selectedServices.length === 0) {
            setError('Please select at least one service category');
            return;
        }
        updateData({ ...data, selectedServices } as any);
        onNext();
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Select Your Services</h2>
                <p className="text-slate-600">
                    Choose the services you want to offer. You can select multiple categories.
                </p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SERVICE_CATEGORIES.map(service => (
                    <button
                        key={service.id}
                        onClick={() => toggleService(service.id)}
                        className={`text-left p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${selectedServices.includes(service.id)
                                ? 'border-teal-600 bg-teal-50 shadow-md'
                                : 'border-slate-200 bg-white hover:border-teal-300'
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="text-3xl flex-shrink-0">{service.icon}</div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900 mb-1">{service.name}</h3>
                                <p className="text-sm text-slate-600">{service.description}</p>
                            </div>
                            {selectedServices.includes(service.id) && (
                                <div className="text-teal-600 text-xl flex-shrink-0">✓</div>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div className="text-sm text-teal-900">
                        <p className="font-semibold mb-1">Pro Tip:</p>
                        <p>Selecting multiple services increases your chances of getting more bookings!</p>
                    </div>
                </div>
            </div>

            {selectedServices.length > 0 && (
                <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm font-semibold text-slate-700 mb-2">
                        Selected Services ({selectedServices.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {selectedServices.map(serviceId => {
                            const service = SERVICE_CATEGORIES.find(s => s.id === serviceId);
                            return (
                                <span
                                    key={serviceId}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium"
                                >
                                    <span>{service?.icon}</span>
                                    <span>{service?.name}</span>
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="flex gap-3 pt-4">
                <Button variant="secondary" onClick={onBack} className="flex-1">
                    Back
                </Button>
                <Button onClick={handleNext} className="flex-1">
                    Continue
                </Button>
            </div>
        </div>
    );
};
