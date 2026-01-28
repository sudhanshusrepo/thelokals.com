
export interface UserLocation {
  lat: number;
  lng: number;
  pincode: string;
  address: string;
  accuracy: number; // meters
}

export interface MapConfig {
  apiKey: string;
  libraries: ('places' | 'geometry')[];
}
