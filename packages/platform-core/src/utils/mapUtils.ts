
/**
 * Utilities for map navigation and deep linking.
 */

interface NavigationOptions {
    lat: number;
    lng: number;
    label?: string; // e.g. "Customer Location"
    app?: 'google' | 'apple' | 'waze';
}

/**
 * Opens an external navigation app with the specified coordinates.
 * @param {NavigationOptions} options 
 */
export const openNavigationApp = ({ lat, lng, label, app = 'google' }: NavigationOptions) => {
    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

    // Default to Google Maps URL (Universal)
    // api=1&query=lat,lng ensures a search/pin drop.
    // &dir_action=navigate launches navigation mode immediately.
    let url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    if (app === 'apple' || (isIOS && app !== 'google')) {
        // Apple Maps Scheme
        // daddr=lat,lng
        url = `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`;
    } else if (app === 'waze') {
        // Waze Scheme
        url = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
    }

    // Attempt to open
    // In a React Native context, this would effectively be Linking.openURL(url)
    // In Web, window.open
    if (typeof window !== 'undefined') {
        window.open(url, '_blank');
    }
};

/**
 * Calculates the bounding box for a set of points.
 * Useful for adjusting map zoom.
 */
export const getBoundsFromPoints = (points: { lat: number, lng: number }[]) => {
    if (points.length === 0) return null;
    let minLat = points[0].lat;
    let maxLat = points[0].lat;
    let minLng = points[0].lng;
    let maxLng = points[0].lng;

    points.forEach(p => {
        if (p.lat < minLat) minLat = p.lat;
        if (p.lat > maxLat) maxLat = p.lat;
        if (p.lng < minLng) minLng = p.lng;
        if (p.lng > maxLng) maxLng = p.lng;
    });

    return {
        north: maxLat,
        south: minLat,
        east: maxLng,
        west: minLng
    };
};
