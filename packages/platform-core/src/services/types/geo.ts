
// packages/platform-core/src/services/types/geo.ts

export interface AvailabilityResponse {
    service_code: string;
    pincode: string;
    is_enabled: boolean;
    resolved_scope: 'GLOBAL' | 'STATE' | 'CITY' | 'PINCODE';
    scope_name?: string;
    resolved_at?: string;
    cache_hit?: boolean;
}
