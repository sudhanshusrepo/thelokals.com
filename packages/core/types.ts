
// This enum now includes both the original and new service categories,
// ensuring no services are missing.
export enum WorkerCategory {
  // Original Home Services
  PLUMBER = 'Plumber',
  ELECTRICIAN = 'Electrician',
  MAID = 'MaidService',
  CARPENTER = 'Carpenter',
  PAINTER = 'Painter',
  GARDENER = 'Gardener',
  HOUSE_CLEANING = 'HouseCleaning',
  LAUNDRY_SERVICE = 'LaundryService',
  PEST_CONTROL = 'PestControl',
  APPLIANCE_REPAIR = 'ApplianceRepair',
  LOCKSMITH = 'Locksmith',
  PACKERS_AND_MOVERS = 'Packers&Movers',

  // Original Auto & Transportation
  MECHANIC = 'Mechanic',
  CAR_WASHING = 'CarWashing',
  DRIVER = 'Driver',
  BIKE_wahin = 'BikeRepair',
  ROADSIDE_ASSISTANCE = 'RoadsideAssistance',

  // Original Personal & Family
  TUTOR = 'Tutor',
  FITNESS_TRAINER = 'FitnessTrainer',
  DOCTOR_NURSE = 'Doctor/Nurse',
  TIFFIN_SERVICE = 'TiffinService',
  BEAUTICIAN = 'Beautician',
  BABYSITTER = 'Babysitter',
  PET_SITTER = 'PetSitter',
  COOK = 'Cook',

  // Original Other Essentials
  ERRAND_RUNNER = 'ErrandRunner',
  DOCUMENTATION_ASSISTANCE = 'Documentation',

  // Newly Added Categories
  TECH_SUPPORT = 'TechSupport',
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
