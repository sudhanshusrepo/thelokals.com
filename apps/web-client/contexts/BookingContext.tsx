'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { trackFunnelStep, trackFunnelAbandonment } from '../lib/analytics';

export interface BookingData {
    serviceCode: string;
    serviceName: string;
    serviceCategory?: string;
    address: string;
    city?: string;
    pincode?: string;
    scheduledDate: string;
    scheduledTime: string;
    notes?: string;
    issueDescription?: string;
    estimatedPrice?: number;
    selectedProviderId?: string;
    providerName?: string;
}

interface BookingContextType {
    bookingData: BookingData | null;
    setBookingData: (data: Partial<BookingData>) => void;
    updateBookingData: (updates: Partial<BookingData>) => void;
    clearBookingData: () => void;
    isBookingInProgress: boolean;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const STORAGE_KEY = 'lokals_booking_data';

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [bookingData, setBookingDataState] = useState<BookingData | null>(null);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setBookingDataState(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading booking data:', error);
        }
    }, []);

    // Save to localStorage whenever bookingData changes
    useEffect(() => {
        try {
            if (bookingData) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(bookingData));
            } else {
                localStorage.removeItem(STORAGE_KEY);
            }
        } catch (error) {
            console.error('Error saving booking data:', error);
        }
    }, [bookingData]);

    const setBookingData = (data: Partial<BookingData>) => {
        const isNewBooking = !bookingData;
        const newData = {
            ...bookingData,
            ...data
        } as BookingData;

        setBookingDataState(newData);

        // Track funnel steps
        if (isNewBooking && data.serviceCode) {
            trackFunnelStep('booking', 1, 'service_selected', {
                serviceCode: data.serviceCode,
                serviceName: data.serviceName,
            });
        }

        if (data.address && !bookingData?.address) {
            trackFunnelStep('booking', 2, 'location_entered', {
                city: data.city,
            });
        }

        if (data.scheduledDate && !bookingData?.scheduledDate) {
            trackFunnelStep('booking', 3, 'datetime_selected', {
                date: data.scheduledDate,
            });
        }

        if (data.selectedProviderId && !bookingData?.selectedProviderId) {
            trackFunnelStep('booking', 4, 'provider_selected', {
                providerId: data.selectedProviderId,
            });
        }
    };

    const updateBookingData = (updates: Partial<BookingData>) => {
        setBookingDataState(prev => {
            if (!prev) return null;
            return { ...prev, ...updates };
        });
    };

    const clearBookingData = () => {
        // Track abandonment if booking was in progress
        if (bookingData) {
            const step = bookingData.selectedProviderId ? 4 :
                bookingData.scheduledDate ? 3 :
                    bookingData.address ? 2 : 1;

            trackFunnelAbandonment('booking', step, 'booking_cleared', 'user_cancelled');
        }

        setBookingDataState(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    const isBookingInProgress = bookingData !== null;

    return (
        <BookingContext.Provider
            value={{
                bookingData,
                setBookingData,
                updateBookingData,
                clearBookingData,
                isBookingInProgress
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
