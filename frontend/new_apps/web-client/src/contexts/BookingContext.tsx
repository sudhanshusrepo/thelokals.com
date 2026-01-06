'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the steps in the booking funnel
export type BookingStep = 'service' | 'package' | 'schedule' | 'address' | 'review' | 'payment';

export interface BookingData {
    // Service Details
    serviceId: string;
    serviceName: string;
    serviceImage?: string;
    basePrice: number;

    // Package Selection
    selectedPackageId?: string;
    packagePrice?: number;

    // Scheduling
    scheduledDate?: string; // ISO Date string
    scheduledTime?: string; // Time slot string

    // Location
    addressId?: string;
    addressDetails?: string;
    coordinates?: { lat: number, lng: number };

    // Payment
    paymentMethod?: 'upi' | 'card' | 'cash';
    totalAmount: number;

    // Meta
    currentStep: BookingStep;
}

interface BookingContextType {
    bookingData: BookingData | null;
    startBooking: (service: { id: string, name: string, price: number, image: string }) => void;
    updateBooking: (data: Partial<BookingData>) => void;
    nextStep: () => void;
    prevStep: () => void;
    clearBooking: () => void;
    canProceed: (step: BookingStep) => boolean;
    confirmBooking: (userId: string) => Promise<string>;
    isSubmitting: boolean;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const STORAGE_KEY = 'lokals_booking_session_v2';

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setBookingData(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading booking data:', error);
        }
    }, []);

    // Save to localStorage
    useEffect(() => {
        if (bookingData) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(bookingData));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [bookingData]);

    const startBooking = (service: { id: string, name: string, price: number, image: string }) => {
        setBookingData({
            serviceId: service.id,
            serviceName: service.name,
            serviceImage: service.image,
            basePrice: service.price,
            totalAmount: service.price,
            currentStep: 'package'
        });
    };

    const updateBooking = (data: Partial<BookingData>) => {
        setBookingData(prev => {
            if (!prev) return null;
            return { ...prev, ...data };
        });
    };

    const nextStep = () => {
        if (!bookingData) return;

        const steps: BookingStep[] = ['service', 'package', 'schedule', 'address', 'review', 'payment'];
        const currentIndex = steps.indexOf(bookingData.currentStep);

        if (currentIndex < steps.length - 1) {
            updateBooking({ currentStep: steps[currentIndex + 1] });
        }
    };

    const prevStep = () => {
        if (!bookingData) return;

        const steps: BookingStep[] = ['service', 'package', 'schedule', 'address', 'review', 'payment'];
        const currentIndex = steps.indexOf(bookingData.currentStep);

        if (currentIndex > 0) {
            updateBooking({ currentStep: steps[currentIndex - 1] });
        }
    };

    const clearBooking = () => {
        setBookingData(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    const canProceed = (step: BookingStep): boolean => {
        if (!bookingData) return false;

        switch (step) {
            case 'package':
                return !!bookingData.selectedPackageId; // Must select a package variant
            case 'schedule':
                return !!bookingData.scheduledDate && !!bookingData.scheduledTime;
            case 'address':
                return !!bookingData.addressId || !!bookingData.addressDetails;
            default:
                return true;
        }
    };

    // New function to submit booking to backend
    const confirmBooking = async (userId: string): Promise<string> => {
        if (!bookingData) throw new Error('No booking data');

        setIsSubmitting(true);
        try {
            // Import dynamically to avoid SSR issues if package uses window
            const { bookingService } = await import('@thelocals/core/services/bookingService');

            const { bookingId } = await bookingService.createAIBooking({
                clientId: userId,
                serviceCategory: bookingData.serviceName, // Using name as category for now
                serviceCategoryId: bookingData.serviceId,
                requirements: {
                    packageId: bookingData.selectedPackageId,
                    packagePrice: bookingData.packagePrice
                },
                aiChecklist: [], // Can be populated if we add AI steps later
                estimatedCost: bookingData.totalAmount,
                location: bookingData.coordinates || { lat: 0, lng: 0 },
                address: {
                    details: bookingData.addressDetails,
                    id: bookingData.addressId
                },
                notes: `Scheduled for ${bookingData.scheduledDate} at ${bookingData.scheduledTime}`,
                deliveryMode: 'LOCAL'
            });

            // If payment method is not cash, implementation of payment gateway would go here
            // For now we assume CASH or external flow handled by provider

            clearBooking();
            return bookingId;
        } catch (error) {
            console.error('Booking submission failed:', error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <BookingContext.Provider
            value={{
                bookingData,
                startBooking,
                updateBooking,
                nextStep,
                prevStep,
                clearBooking,
                canProceed,
                confirmBooking,
                isSubmitting
            }}
        >
            {children}
        </BookingContext.Provider>
    );
};

export const useBooking = () => {
    const context = useContext(BookingContext);
    if (context === undefined) {
        throw new Error('useBooking must be used within a BookingProvider');
    }
    return context;
};
