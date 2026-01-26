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

export const publicService = {
    async getServiceCategories(): Promise<ServiceCategory[]> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('service_categories')
            .select('*, service_pricing(base_price, currency)')
            .order('name'); // Or however we want them ordered

        if (error) {
            console.error('Failed to fetch categories:', error);
            return [];
        }

        return (data || []).map((cat: any) => ({
            ...cat,
            base_price: cat.service_pricing?.[0]?.base_price || cat.base_price || 0,
            currency: cat.service_pricing?.[0]?.currency || 'INR'
        }));
    },

    async getServiceCategory(id: string): Promise<ServiceCategory | null> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('service_categories')
            .select('*, service_pricing(base_price, currency)')
            .eq('id', id)
            .maybeSingle();

        if (error) {
            console.error(`Failed to fetch category ${id}:`, error);
            return null;
        }

        if (!data) return null;

        return {
            ...data,
            base_price: data.service_pricing?.[0]?.base_price || data.base_price || 0,
            currency: data.service_pricing?.[0]?.currency || 'INR'
        };
    }
};
