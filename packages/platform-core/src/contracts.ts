/**
 * Platform Core Contracts
 * 
 * Defines the strict interfaces for the core platform domains.
 * Apps (Client/Provider/Admin) interact with the platform via these contracts.
 */

import { BookingStatus, PaymentStatus, WorkerCategory } from '@thelocals/platform-config';

// --- Auth Contracts ---

export interface AuthUser {
    id: string;
    email: string;
    role: 'customer' | 'provider' | 'admin';
    metadata?: Record<string, any>;
}

export interface AuthSession {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
}

// --- Provider Contracts ---

export interface IProviderProfile {
    id: string;
    userId: string;
    name: string;
    category: WorkerCategory;
    rating: number;
    totalReviews: number;
    isVerified: boolean;
    basePrice: number;
    priceUnit: 'hr' | 'visit';
    location: {
        lat: number;
        lng: number;
        address?: string;
    };
}

export interface IProviderService {
    findNearby(lat: number, lng: number, category: string, radius: number): Promise<IProviderProfile[]>;
    getProfile(providerId: string): Promise<IProviderProfile>;
    updateAvailability(providerId: string, isOnline: boolean): Promise<void>;
}

// --- Booking Contracts ---

export interface IBooking {
    id: string;
    customerId: string;
    providerId?: string;
    category: string;
    status: BookingStatus;
    paymentStatus: PaymentStatus;
    totalAmount: number;
    scheduledAt: string;
    createdAt: string;
    location: {
        lat: number;
        lng: number;
    };
}

export interface IBookingService {
    create(payload: Partial<IBooking>): Promise<IBooking>;
    getById(bookingId: string): Promise<IBooking>;
    listForUser(userId: string, role: 'customer' | 'provider'): Promise<IBooking[]>;
    updateStatus(bookingId: string, status: BookingStatus): Promise<IBooking>;
}

// --- Payment Contracts ---

export interface IPaymentIntent {
    id: string;
    clientSecret: string;
    amount: number;
    currency: string;
    status: 'pending' | 'succeeded' | 'failed';
}

export interface IPaymentService {
    createIntent(bookingId: string, amount: number): Promise<IPaymentIntent>;
    confirmPayment(paymentId: string): Promise<boolean>;
}
