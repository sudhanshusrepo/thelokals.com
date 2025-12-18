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
