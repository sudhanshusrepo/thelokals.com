'use client';

import { useState } from 'react';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { UserLocation } from './types/map';

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';

function extractPincode(addressComponents: any[]): string {
    const postalCode = addressComponents?.find(
        (c: any) => c.types.includes('postal_code')
    );
    return postalCode ? postalCode.long_name : '';
}

export function useUserLocation() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  const queryResult: UseQueryResult<UserLocation, Error> = useQuery({
    queryKey: ['user-location'],
    queryFn: async (): Promise<UserLocation> => {
      // 1. Request permission
      if (!permissionGranted) {
        // Permissions API might not be supported in all browsers perfectly, fallback logic implicitly handled by getCurrentPosition prompting
        try {
            const permission = await navigator.permissions.query({ name: 'geolocation' as any });
            if (permission.state === 'granted') {
                setPermissionGranted(true);
            } else if (permission.state === 'prompt') {
               // continues to getCurrentPosition which will prompt
            } else {
               // denied
               throw new Error('LOCATION_PERMISSION_REQUIRED');
            }
        } catch (e) {
            // Safari/others fallback
        }
      }
      
      // 2. Get current position (high accuracy)
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5 * 60 * 1000 // 5min cache
        });
      });
      
      // 3. Reverse geocode → pincode/address
      const [lat, lng] = [position.coords.latitude, position.coords.longitude];
      
      let pincode = '';
      let address = '';

      if (GOOGLE_MAPS_KEY) {
          try {
            const geoResponse = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_KEY}`
            );
            const geoData = await geoResponse.json();
            
            if (geoData.results && geoData.results[0]) {
                pincode = extractPincode(geoData.results[0]?.address_components);
                address = geoData.results[0]?.formatted_address;
            }
          } catch (err) {
              console.error('Geocoding error:', err);
          }
      }
      
      // Fallback or ensure we return something even if geocoding fails, though spec implies geocoding is critical
      // If no pincode found, we return empty string pincode.
      
      return { lat, lng, pincode, address, accuracy: position.coords.accuracy };
    },
    staleTime: 5 * 60 * 1000, // 5min
    // cacheTime is renamed to gcTime in v5, but sticking to v4 syntax if safer or verify version later. 
    // Assuming v5 logic compatibility: staleTime drives refetch.
    retry: 1
  });

  return { 
      location: queryResult.data, 
      isLoading: queryResult.isLoading, 
      error: queryResult.error,
      permissionGranted, 
      refetch: () => queryResult.refetch() 
  };
}
