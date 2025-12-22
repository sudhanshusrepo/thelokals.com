import { supabase } from '@thelocals/core/services/supabase';

export interface SearchResult {
    code: string;
    name: string;
    description?: string;
    category?: string;
}

/**
 * Search for services by name or keywords
 * Uses fuzzy matching with ilike and keyword array contains
 */
export async function searchServices(query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length === 0) {
        return [];
    }

    const searchTerm = query.trim().toLowerCase();

    try {
        const { data, error } = await supabase
            .from('services')
            .select('code, name, description, category')
            .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
            .eq('is_active', true)
            .limit(10);

        if (error) {
            console.error('Search error:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Search exception:', error);
        return [];
    }
}

/**
 * Get autocomplete suggestions for search
 */
export async function getSearchSuggestions(query: string): Promise<string[]> {
    if (!query || query.trim().length < 2) {
        return [];
    }

    const results = await searchServices(query);
    return results.map(r => r.name).slice(0, 5);
}
