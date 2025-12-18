export enum DocType {
    GovtID = 'govt_id',
    PAN = 'pan',
    BankDetails = 'bank_details',
    Selfie = 'selfie',
    Certification = 'certification'
}

export interface ProviderDocument {
    url: string;
    verified: boolean;
    uploaded_at?: string;
    type?: string;
    status?: string;
}

export interface ProviderProfile {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    category: string;
    is_verified: boolean;
    city?: string;
    locality?: string;
    experience_years?: number;
    documents?: Record<string, ProviderDocument>;

    // Wizard/Draft fields
    isPhoneVerified?: boolean;
    dob?: string;
    gender?: string;
    guidelinesAccepted?: boolean;
    registrationStatus?: RegistrationStatus;
    // Add other fields as needed
}

export enum WorkerCategory {
    Plumbing = 'plumbing',
    Electrical = 'electrical',
    Cleaning = 'cleaning',
    Moving = 'moving'
}

export interface Application extends ProviderProfile {
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    submitted_at: string;
}

export enum RegistrationStatus {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export interface AvailabilitySchedule {
    days: string[];
    startTime: string;
    endTime: string;
    enabled: boolean;
}
