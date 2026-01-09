export const CITIES = {
    GURUGRAM: 'Gurugram',
    NEW_DELHI: 'New Delhi',
    NAVI_MUMBAI: 'Navi Mumbai',
    BANGALORE: 'Bangalore',
} as const;

export const AVAILABLE_CITIES = Object.values(CITIES);

export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
    [CITIES.GURUGRAM]: { lat: 28.4595, lng: 77.0266 },
    [CITIES.NEW_DELHI]: { lat: 28.6139, lng: 77.2090 },
    [CITIES.NAVI_MUMBAI]: { lat: 19.0330, lng: 73.0297 },
    [CITIES.BANGALORE]: { lat: 12.9716, lng: 77.5946 },
};
