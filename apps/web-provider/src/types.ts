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
}

export interface ProviderProfile {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    category: string;
    is_verified: boolean;
    documents?: Record<string, ProviderDocument>;
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

export interface AvailabilitySchedule {
    [date: string]: {
        start: string;
        end: string;
    }[];
}
