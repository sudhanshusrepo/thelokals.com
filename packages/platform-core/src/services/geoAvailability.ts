
// packages/platform-core/src/services/geoAvailability.ts
import { supabase } from './supabase';
import { CONFIG } from '../config'; 
import { AvailabilityResponse } from './types/geo';

// Unified Service to check availability
// 1. Worker (Edge)
// 2. RPC (DB Fallback)

export async function isServiceEnabled(serviceCode: string, pincode: string): Promise<boolean> {
  // 1. Try Edge API
  if (CONFIG.EDGE_API_URL) {
    try {
      const url = new URL(`${CONFIG.EDGE_API_URL}/availability/check`);
      url.searchParams.append('service', serviceCode);
      url.searchParams.append('pincode', pincode);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data: AvailabilityResponse = await res.json();
        return data.is_enabled;
      }
    } catch (e) {
      console.warn('Edge availability check failed, falling back to RPC', e);
    }
  }

  // 2. Fallback: Direct Supabase RPC
  const { data, error } = await supabase.rpc('resolve_service_availability', {
    p_service_code: serviceCode,
    p_pincode: pincode
  });

  if (error) {
     console.error('RPC availability check failed', error);
     return true; // Use business logic default (Fail Open vs Fail Closed)
  }

  return data?.[0]?.is_enabled ?? true;
}

// Bulk Check Helper (Optional optimization if worker supports batching, otherwise parallel calls)
export async function areServicesEnabled(serviceCodes: string[], pincode: string): Promise<Record<string, boolean>> {
    const results = await Promise.all(
        serviceCodes.map(async (code) => {
            const enabled = await isServiceEnabled(code, pincode);
            return { code, enabled };
        })
    );
    
    return results.reduce((acc, curr) => {
        acc[curr.code] = curr.enabled;
        return acc;
    }, {} as Record<string, boolean>);
}
