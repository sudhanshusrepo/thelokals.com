
// apps/web-admin/src/features/geo-availability/useGeoService.ts
import { useState } from 'react';
import { supabase } from "@thelocals/platform-core";

export const useGeoService = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const fetchNode = async (type: 'STATE' | 'CITY' | 'PINCODE', parentId?: string) => {
        setLoading(true);
        try {
            // In reality, you'd filter by parentId if provided
            const { data, error } = await supabase
                .from('geo_hierarchy_scaffold')
                .select('*')
                .eq('type', type)
                .match(parentId ? { parent_id: parentId } : {});
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error(error);
            setError(error);
            return { data: null, error };
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async () => {
        const { data, error } = await supabase.from('services').select('id, name').order('name');
        return { data, error };
    };

    const toggleAvailability = async (serviceId: string, scopeType: string, scopeId: string, isEnabled: boolean) => {
        setLoading(true);
        try {
            const { error } = await supabase.rpc('toggle_service_availability', {
                p_service_id: serviceId,
                p_scope_type: scopeType,
                p_scope_id: scopeId,
                p_is_enabled: isEnabled
            });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Toggle failed:', error);
            setError(error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { fetchNode, fetchServices, toggleAvailability, loading, error };
};
