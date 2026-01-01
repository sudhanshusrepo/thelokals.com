
import { Coordinates } from '@thelocals/core/types';

export const isLocationInBetaArea = (location: Coordinates | null): boolean => {
    if (!location) return false;

    const { lat, lng } = location;

    // Approximate Bounding Box for Delhi NCR (Gurgaon, Delhi, Noida)
    // Lat: 28.20 to 28.90
    // Lng: 76.80 to 77.60
    const isLatValid = lat >= 28.20 && lat <= 28.90;
    const isLngValid = lng >= 76.80 && lng <= 77.60;

    return isLatValid && isLngValid;
};

export const BETA_OFFER_DETAILS = {
    code: 'BETA_FREE_AC',
    title: 'Free AC Service',
    description: 'Exclusive Beta Offer for Gurgaon & Delhi!',
    color: 'from-rose-500 to-pink-600',
    icon: '❄️'
};
