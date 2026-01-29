import { Booking } from './types';
import { Database } from './types/supabase';

// Export raw database types for use in services
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Wrapper for RPC return types
export type RpcReturnType<T extends keyof Database['public']['Functions']> = Database['public']['Functions'][T]['Returns'];

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

// Composite type for Worker (Provider + Profile + Category)
// This roughly matches what the app expects after joining tables
export interface DatabaseWorker {
    id: string;
    name: string;
    category: string;
    description: string;
    price: number;
    price_per_hour?: number; // DB column is price_per_hour
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

// Directly use the RPC return type for source-of-truth
export type DbNearbyProviderResponse = Database['public']['Functions']['find_nearby_providers']['Returns'][number];


