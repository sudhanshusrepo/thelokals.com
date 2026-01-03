'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ServiceCard, ServiceVariant } from '../../../components/ui/ServiceCard';
import { MapPin, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingService } from '@thelocals/core/services/bookingService';
import { useAuth } from '../../../contexts/AuthContext';

interface ServiceDetails {
    code: string;
    name: string;
    description: string;
    icon?: string;
    category: string;
}

// Mock service data - will be replaced with API call
const getServiceDetails = (serviceCode: string): ServiceDetails => {
    const services: Record<string, ServiceDetails> = {
        'ac-repair': {
            code: 'ac-repair',
            name: 'AC Repair & Service',
            description: 'Professional AC repair and maintenance services',
            icon: '❄️',
            category: 'Home Services',
        },
        'electrician': {
            code: 'electrician',
            name: 'Electrician Services',
            description: 'Expert electrical repairs and installations',
            icon: '⚡',
            category: 'Home Services',
        },
        'plumber': {
            code: 'plumber',
            name: 'Plumbing Services',
            description: 'Professional plumbing repairs and installations',
            icon: '🔧',
            category: 'Home Services',
        },
        'salon': {
            code: 'salon',
            name: 'Salon for Women',
            description: 'Premium salon services at home',
            icon: '💇‍♀️',
            category: 'Beauty',
        }
    };

    return services[serviceCode] || {
        code: serviceCode,
        name: 'Service',
        description: 'Professional service',
        icon: '🛠️',
        category: 'Services',
    };
};

export default function ServiceSelectionPage() {
    const params = useParams();
    const router = useRouter();
    const serviceCode = params?.id as string;

    const [selectedVariant, setSelectedVariant] = useState<ServiceVariant | null>(null);
    const [location, setLocation] = useState<string>('');
    const [isLoadingLocation, setIsLoadingLocation] = useState(true);
    const [details, setDetails] = useState<string>('');
    const [serviceDetails, setServiceDetails] = useState<ServiceDetails | null>(null);

    // Load service details
    useEffect(() => {
        if (serviceCode) {
            const details = getServiceDetails(serviceCode);
            setServiceDetails(details);
        }
    }, [serviceCode]);

    // Auto-fill location from GPS
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const detectLocation = async () => {
            try {
                if (!navigator.geolocation) {
                    setLocation('Narnaund, Haryana');
                    setIsLoadingLocation(false);
                    return;
                }

                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;

                        try {
                            const response = await fetch(
                                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                            );
                            const data = await response.json();

                            // Build full address
                            const parts = [];
                            if (data.address?.road) parts.push(data.address.road);
                            if (data.address?.suburb || data.address?.neighbourhood) {
                                parts.push(data.address.suburb || data.address.neighbourhood);
                            }
                            const city = data.address?.city || data.address?.town || data.address?.village || '';
                            if (city) parts.push(city);
                            const state = data.address?.state || '';
                            if (state) parts.push(state);

                            setLocation(parts.join(', ') || 'Your Location');
                        } catch (error) {
                            setLocation('Your Location');
                        }
                        setIsLoadingLocation(false);
                    },
                    (error) => {
                        console.error('Location error:', error);
                        setLocation('Narnaund, Haryana');
                        setIsLoadingLocation(false);
                    },
                    { timeout: 5000, enableHighAccuracy: true }
                );
            } catch (error) {
                setLocation('Narnaund, Haryana');
                setIsLoadingLocation(false);
            }
        };

        detectLocation();
    }, []);

    const { user, loading: authLoading } = useAuth();

    const handleRequestService = async () => {
        if (!selectedVariant) {
            toast.error('Please select a service variant');
            return;
        }

        if (!location.trim()) {
            toast.error('Please provide your location');
            return;
        }

        if (authLoading) return;

        if (!user) {
            toast.error('Please log in to request a service');
            router.push(`/auth?redirect=/services/${serviceCode}`);
            return;
        }

        // Create request and navigate to live request page
        const loadingToast = toast.loading('Creating your live request...');

        try {
            // Parse location string (simplified for now)
            const locationCoords = { lat: 0, lng: 0 };

            const { bookingId } = await bookingService.createAIBooking({
                clientId: user.id,
                serviceCategory: serviceDetails?.category || 'General',
                requirements: {
                    variant: selectedVariant,
                    details: details,
                    serviceCode: serviceCode
                },
                aiChecklist: [], // populated by backend AI
                estimatedCost: selectedVariant === 'basic' ? 350 : selectedVariant === 'med' ? 550 : 850,
                location: locationCoords,
                address: { full_address: location },
                notes: details
            });

            toast.success('Request broadcasted!', { id: loadingToast });
            router.push(`/live-request/${bookingId}`);

        } catch (error) {
            console.error('Failed to create booking:', error);
            toast.error('Failed to create request. Please try again.', { id: loadingToast });
        }
    };

    if (!serviceDetails) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-pulse text-muted">Loading service details...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-neutral-200 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} className="text-foreground" />
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{serviceDetails.icon}</span>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">{serviceDetails.name}</h1>
                            <p className="text-sm text-neutral-500">{serviceDetails.category}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Service Description */}
                <div className="mb-8">
                    <p className="text-lg text-foreground mb-2">{serviceDetails.description}</p>
                    <p className="text-sm text-neutral-500">Select a service variant and provide your details to post a live request</p>
                </div>

                {/* Variant Selection */}
                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Choose Service Variant</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <ServiceCard
                            variant="basic"
                            serviceName={serviceDetails.name}
                            description="Essential service with standard quality and quick turnaround"
                            icon={serviceDetails.icon}
                            isSelected={selectedVariant === 'basic'}
                            onClick={() => setSelectedVariant('basic')}
                            data-testid="variant-basic"
                        />
                        <ServiceCard
                            variant="med"
                            serviceName={serviceDetails.name}
                            description="Standard service plus additional checks and premium materials"
                            icon={serviceDetails.icon}
                            isSelected={selectedVariant === 'med'}
                            onClick={() => setSelectedVariant('med')}
                            data-testid="variant-med"
                        />
                        <ServiceCard
                            variant="full"
                            serviceName={serviceDetails.name}
                            description="Complete package with comprehensive service and warranty"
                            icon={serviceDetails.icon}
                            isSelected={selectedVariant === 'full'}
                            onClick={() => setSelectedVariant('full')}
                            data-testid="variant-full"
                        />
                    </div>
                </section>

                {/* Location Input */}
                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Service Location</h2>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <MapPin size={20} className="text-neutral-400" />
                        </div>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder={isLoadingLocation ? 'Detecting your location...' : 'Enter your service location'}
                            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-neutral-200 focus:border-primary rounded-xl text-foreground placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                            data-testid="location-input"
                        />
                        {isLoadingLocation && (
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                            </div>
                        )}
                    </div>
                    <p className="mt-2 text-sm text-neutral-500">
                        We've auto-detected your location. You can edit it if needed.
                    </p>
                </section>

                {/* Optional Details */}
                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Additional Details (Optional)</h2>
                    <textarea
                        value={details}
                        onChange={(e) => {
                            if (e.target.value.length <= 500) {
                                setDetails(e.target.value);
                            }
                        }}
                        placeholder="Describe your issue or any specific requirements... (e.g., AC not cooling, need urgent service)"
                        rows={4}
                        className="w-full px-4 py-3 bg-white border-2 border-neutral-200 focus:border-primary rounded-xl text-foreground placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
                        data-testid="details-textarea"
                    />
                    <div className="mt-2 flex justify-between items-center">
                        <p className="text-sm text-neutral-500">
                            Help providers understand your needs better
                        </p>
                        <span className="text-sm text-neutral-500">
                            {details.length}/500
                        </span>
                    </div>
                </section>

                {/* Request Service Button */}
                <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm py-6 border-t border-neutral-200 -mx-4 px-4 bg-white">
                    <button
                        onClick={handleRequestService}
                        disabled={!selectedVariant || !location.trim()}
                        className="w-full group relative px-8 py-4 bg-primary hover:bg-primary-600 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:scale-100 flex items-center justify-center gap-3"
                        style={{ fontSize: '18px', minHeight: '56px' }}
                        data-testid="request-service-btn"
                    >
                        <span className="relative z-10">
                            {selectedVariant ? `Request Service - ₹${selectedVariant === 'basic' ? '350' : selectedVariant === 'med' ? '550' : '850'}` : 'Select a Variant to Continue'}
                        </span>
                        {selectedVariant && (
                            <svg
                                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        )}
                    </button>
                </div>
            </main>
        </div>
    );
}
