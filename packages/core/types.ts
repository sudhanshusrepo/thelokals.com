
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
  // Online Categories
  DIGITAL_MARKETING = 'DigitalMarketing',
  CONTENT_CREATIVE = 'ContentCreative',
  TECH_DEV = 'TechDev',
  BUSINESS_OPS = 'BusinessOps',
  KNOWLEDGE_SERVICES = 'KnowledgeServices',
  PROFESSIONAL_ADVISORY = 'ProfessionalAdvisory',
  WELLNESS_ONLINE = 'WellnessOnline',
  CREATOR_ECONOMY = 'CreatorEconomy',
  LOCAL_BIZ_DIGITIZATION = 'LocalBizDigitization',
  OTHER = 'Other',
}

export interface Coordinates {
  lat: number;
  lng: number;
}

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
  availabilitySchedule?: Record<string, any>; // New field
}

export type BookingStatus = 'REQUESTED' | 'PENDING' | 'CONFIRMED' | 'EN_ROUTE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
export type BookingType = 'AI_ENHANCED' | 'LIVE' | 'SCHEDULED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';

export type UserProfile = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export interface Customer {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface Booking {
  id: string;
  client_id: string;
  provider_id?: string;
  service_category: string;
  service_category_id?: string; // New field
  booking_type: BookingType;
  delivery_mode?: 'LOCAL' | 'ONLINE'; // New field
  status: BookingStatus;
  requirements?: object;
  ai_checklist?: string[];
  estimated_cost?: number;
  final_cost?: number;
  scheduled_date?: string;
  started_at?: string;
  completed_at?: string;
  location?: Coordinates,
  address?: object;
  notes?: string;
  meeting_link?: string; // New field
  meeting_provider?: string; // New field
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
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


// NEW LIVE BOOKING SYSTEM TYPES

export interface Service {
  id: string;
  name: string;
  formSchema: {
    requiredFields: string[];
  };
  isActive: boolean;
}

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string; // e.g., "1 hr", "30 mins"
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

export type LiveBookingStatus = BookingStatus;

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
  checklist?: string[];
  estimatedCost?: number;
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

export interface NearbyProviderResponse {
  provider_id: string;
  provider_name: string;
  distance_km: number;
  rating: number;
  total_jobs: number;
  is_verified: boolean;
}

export type AdminRole = 'super_admin' | 'ops_admin' | 'support_admin' | 'finance_admin' | 'read_only';

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface ServiceAvailability {
  id: string;
  service_category_id: string;
  location_type: 'city' | 'area' | 'pincode';
  location_value: string;
  status: 'ENABLED' | 'DISABLED';
  reason?: string;
  disabled_by?: string;
  disabled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ActiveSession {
  id: string;
  user_id: string;
  user_type: 'customer' | 'provider';
  session_state?: string;
  city?: string;
  current_booking_id?: string;
  last_activity: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AdminAuditLog {
  id: string;
  admin_user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  changes?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}
