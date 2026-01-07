import { Booking, WorkerProfile, Coordinates } from './types';

export interface BookingWithWorkerResponse extends Omit<Booking, 'worker'> {
    workers: {
        id: string;
        name: string;
        category: string;
        description: string;
        price: number;
        price_unit: 'hr' | 'visit' | 'service';
        rating: number;
        status: string;
        image_url: string;
        expertise: string[];
        review_count: number;
        is_verified: boolean;
        location_lat: number;
        location_lng: number;
    } | null;
}

export interface DatabaseWorker {
    id: string;
    name: string;
    category: string;
    description: string;
    price: number;
    price_per_hour?: number; // Some tables might use this
    price_unit: 'hr' | 'visit' | 'service';
    rating: number;
    status: string;
    image_url: string;
    expertise: string[];
    review_count: number;
    experience_years?: number;
    is_verified: boolean;
    location_lat: number;
    location_lng: number;
    full_name?: string;
    phone?: string;
    created_at?: string;
}

export interface DbNearbyProviderResponse {
    id: string;
    name: string;
    category: string;
    lat: number;
    lng: number;
    distance: number; // in meters
    price: number;
    rating: number;
    review_count: number;
    image_url: string;
    is_verified?: boolean;
}

