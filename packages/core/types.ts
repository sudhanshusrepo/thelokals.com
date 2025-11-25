
// This enum now includes both the original and new service categories,
// ensuring no services are missing.
export enum WorkerCategory {
  // Original Home Services
  PLUMBER = 'Plumber',
  ELECTRICIAN = 'Electrician',
  MAID = 'Maid Service',
  CARPENTER = 'Carpenter',
  PAINTER = 'Painter',
  GARDENER = 'Gardener',
  HOUSE_CLEANING = 'House Cleaning',
  LAUNDRY_SERVICE = 'Laundry Service',
  PEST_CONTROL = 'Pest Control',
  APPLIANCE_REPAIR = 'Appliance Repair',
  LOCKSMITH = 'Locksmith',
  PACKERS_AND_MOVERS = 'Packers & Movers',

  // Original Auto & Transportation
  MECHANIC = 'Mechanic',
  CAR_WASHING = 'Car Washing',
  DRIVER = 'Driver',
  BIKE_wahin = 'Bike Repair',
  ROADSIDE_ASSISTANCE = 'Roadside Assistance',

  // Original Personal & Family
  TUTOR = 'Tutor',
  FITNESS_TRAINER = 'Fitness Trainer',
  DOCTOR_NURSE = 'Doctor/Nurse',
  TIFFIN_SERVICE = 'Tiffin Service',
  BEAUTICIAN = 'Beautician',
  BABYSITTER = 'Babysitter',
  PET_SITTER = 'Pet Sitter',
  COOK = 'Cook',

  // Original Other Essentials
  ERRAND_RUNNER = 'Errand Runner',
  DOCUMENTATION_ASSISTANCE = 'Documentation',

  // Newly Added Categories
  TECH_SUPPORT = 'Tech Support',
  PHOTOGRAPHY = 'Photography',
  VIDEOGRAPHY = 'Videography',
  SECURITY = 'Security',
  CATERING = 'Catering',

  OTHER = 'Other',
}

export type Coordinates = {
  lat: number;
  lng: number;
};

export type WorkerStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

// This type remains aligned with the database schema.
export interface WorkerProfile {
  id: string;
  name: string;
  category: WorkerCategory;
  description: string;
  price: number;
  priceUnit: 'hr' | 'visit' | 'service';
  rating: number;
  status: WorkerStatus;
  imageUrl: string;
  expertise: string[];
  reviewCount: number;
  isVerified: boolean;
  location: Coordinates;
}

export type BookingStatus = | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export type UserProfile = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export interface Booking {
  id: string;
  user_id: string;
  worker_id: string;
  date: string;
  status: BookingStatus;
  total_price: number;
  payment_status: 'paid' | 'unpaid';
  note?: string;
  user?: UserProfile;
  worker?: WorkerProfile;
  review?: Review;
}

export interface Review {
  id: string;
  booking_id: string;
  user_id: string;
  worker_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}
