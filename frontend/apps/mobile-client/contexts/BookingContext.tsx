import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types
export interface Service {
    id: string;
    name: string;
    image: string;
    price: number;
    rating: number;
    reviews: number;
    duration: string;
    category: string;
}

export interface Package {
    id: string;
    name: string;
    price: number;
    duration: string;
    description: string;
}

export interface Slot {
    id: string;
    date: string;
    time: string;
    available: boolean;
}

export interface Address {
    id: string;
    name: string;
    address: string;
    city: string;
    pincode: string;
    isDefault: boolean;
}

export interface Addon {
    id: string;
    name: string;
    price: number;
}

export type PaymentMethod = 'upi' | 'card' | 'cash';

export interface BookingState {
    service: Service | null;
    package: Package | null;
    slot: Slot | null;
    address: Address | null;
    addons: Addon[];
    paymentMethod: PaymentMethod | null;
    total: number;
}

interface BookingContextType {
    booking: BookingState;
    updateBooking: (updates: Partial<BookingState>) => void;
    calculateTotal: () => number;
    resetBooking: () => void;
}

const initialBookingState: BookingState = {
    service: null,
    package: null,
    slot: null,
    address: null,
    addons: [],
    paymentMethod: null,
    total: 0,
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
    const [booking, setBooking] = useState<BookingState>(initialBookingState);

    const updateBooking = (updates: Partial<BookingState>) => {
        setBooking(prev => {
            const newState = { ...prev, ...updates };
            // Auto-calculate total when relevant fields change
            if (updates.package || updates.addons) {
                newState.total = calculateTotalForState(newState);
            }
            return newState;
        });
    };

    const calculateTotalForState = (state: BookingState): number => {
        const basePrice = state.package?.price || 0;
        const addonsPrice = state.addons.reduce((sum, addon) => sum + addon.price, 0);
        const subtotal = basePrice + addonsPrice;
        const tax = subtotal * 0.1; // 10% tax
        return Math.round(subtotal + tax);
    };

    const calculateTotal = (): number => {
        return calculateTotalForState(booking);
    };

    const resetBooking = () => {
        setBooking(initialBookingState);
    };

    return (
        <BookingContext.Provider value={{ booking, updateBooking, calculateTotal, resetBooking }}>
            {children}
        </BookingContext.Provider>
    );
};

export const useBooking = () => {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error('useBooking must be used within BookingProvider');
    }
    return context;
};
