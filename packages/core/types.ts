
export enum WorkerCategory {
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
  MECHANIC = 'Mechanic',
  CAR_WASHING = 'CarWashing',
  DRIVER = 'Driver',
  BIKE_REPAIR = 'BikeRepair',
  ROADSIDE_ASSISTANCE = 'RoadsideAssistance',
  TUTOR = 'Tutor',
  FITNESS_TRAINER = 'FitnessTrainer',
  DOCTOR_NURSE = 'Doctor/Nurse',
  TIFFIN_SERVICE = 'TiffinService',
  BEAUTICIAN = 'Beautician',
  BABYSITTER = 'Babysitter',
  PET_SITTER = 'PetSitter',
  COOK = 'Cook',
  ERRAND_RUNNER = 'ErrandRunner',
  DOCUMENTATION_ASSISTANCE = 'Documentation',
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

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type UserProfile = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export interface Booking {
  id:string;
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
  // New fields for live booking
  serviceId?: string;
  clientId?: string;
  providerId?: string;
  requirements?: any;
  otp?: string;
  acceptedAt?: any;
  startedAt?: any;
  completedAt?: any;
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


// NEW LIVE BOOKING SYSTEM TYPES

export interface Service {
  id: string;
  name: string;
  formSchema: {
    requiredFields: string[];
  };
  isActive: boolean;
}

export interface User {
  userId: string;
  role: 'client' | 'provider';
  name: string;
  phone: string;
  location: Coordinates;
}

export interface Provider {
  providerId: string;
  services: string[];
  isOnline: boolean;
  location: Coordinates;
}

export type LiveBookingStatus = 'REQUESTED' | 'ACCEPTED' | 'OTP_SENT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface LiveBooking {
  id: string;
  serviceId: string;
  clientId: string;
  providerId: string | null;
  status: LiveBookingStatus;
  requirements: {
    [key: string]: any;
  };
  otp: string;
  createdAt: any; // serverTimestamp
  acceptedAt: any | null;
  startedAt: any | null;
  completedAt: any | null;
}

export interface BookingRequest {
  requestId: string;
  bookingId: string;
  providerId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
}
