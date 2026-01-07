/**
 * Lokals Platform Glossary
 * 
 * This module defines the core business entities and actor types used across the platform.
 * Reference: docs/terminology.md
 */

export enum UserRole {
    CUSTOMER = 'customer',
    PROVIDER = 'provider',
    ADMIN = 'admin',
}

export type Customer = {
    id: string;
    email: string;
    phoneNumber?: string;
    fullName: string;
    avatarUrl?: string;
    createdAt: string;
};

export type ServiceProvider = {
    id: string;
    userId: string; // Link to auth user
    businessName: string;
    profession: string;
    rating: number;
    verified: boolean;
    latitude: number;
    longitude: number;
};

export enum BookingStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

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

export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';

export type ServiceRequest = {
    id: string;
    customerId: string;
    categoryId: string;
    description: string;
    status: 'draft' | 'open' | 'assigned' | 'closed';
    scheduledAt?: string;
    location: {
        lat: number;
        lng: number;
        address: string;
    };
};

export const PLATFORM_NAME = 'The Lokals';
