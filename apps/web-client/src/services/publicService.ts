import { createClient } from '../lib/supabase';
// import { ServiceCategory, ServiceItem } from '@thelocals/platform-core';

export interface ServiceCategory {
    id: string;
    name: string;
    description?: string;
    image_url?: string;
    type: 'SERVICE' | 'RENTAL';
    base_price?: number;
    currency?: string;
}

// Mock data for development/fallback
const MOCK_CATEGORIES: ServiceCategory[] = [
    {
        id: 'mock-ac-repair',
        name: 'AC Service & Repair',
        description: 'Expert AC cooling and servicing',
        image_url: 'https://images.unsplash.com/photo-1581094794320-c91bed7828e8?w=800&q=80',
        type: 'SERVICE',
        base_price: 499,
        currency: 'INR'
    },
    {
        id: 'mock-cleaning',
        name: 'Home Cleaning',
        description: 'Deep cleaning for your home',
        image_url: 'https://images.unsplash.com/photo-1581578731117-104f2a8d275d?w=800&q=80',
        type: 'SERVICE',
        base_price: 999,
        currency: 'INR'
    },
    {
        id: 'mock-car-rental',
        name: 'SUV Rental',
        description: 'Premium SUV for weekend getaways',
        image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
        type: 'RENTAL',
        base_price: 2500,
        currency: 'INR'
    }
];

export const publicService = {
    async getServiceCategories(): Promise<ServiceCategory[]> {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('service_categories')
                .select('*, service_pricing(base_price, currency)')
                .eq('is_active', true)
                .order('name');

            if (error || !data || data.length === 0) {
                console.warn('Fetching categories failed or empty, using mock data for dev.');
                return MOCK_CATEGORIES;
            }

            return data.map((cat: any) => ({
                ...cat,
                base_price: cat.service_pricing?.[0]?.base_price || cat.base_price || 0,
                currency: cat.service_pricing?.[0]?.currency || 'INR'
            }));
        } catch (e) {
            console.warn('Supabase client error, using mock data:', e);
            return MOCK_CATEGORIES;
        }
    },

    async getServiceCategory(id: string): Promise<ServiceCategory | null> {
        // Mock fallback check
        if (id.startsWith('mock-')) {
            return MOCK_CATEGORIES.find(c => c.id === id) || null;
        }

        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('service_categories')
                .select('*, service_pricing(base_price, currency)')
                .eq('id', id)
                .maybeSingle();

            if (error) {
                console.warn(`Failed to fetch category ${id}, trying mock fallback.`);
                return null;
            }

            if (!data) return null;

            return {
                ...data,
                base_price: data.service_pricing?.[0]?.base_price || data.base_price || 0,
                currency: data.service_pricing?.[0]?.currency || 'INR'
            };
        } catch (e) {
            console.error('Supabase fetch error:', e);
            return null;
        }
    }
};
