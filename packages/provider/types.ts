import { WorkerCategory } from '@thelocals/core';

export { WorkerCategory };

export type ProviderProfile = OnboardingData;

export enum DocType {
    GovtID = 'GovtID',
    PAN = 'PAN',
    Selfie = 'Selfie',
    BankDetails = 'BankDetails',
}

export enum RegistrationStatus {
    Draft = 'draft',
    Incomplete = 'incomplete',
    Pending = 'pending',
    Submitted = 'submitted',
    Approved = 'approved',
    Rejected = 'rejected',
}

export interface ProviderDocument {
    type: DocType;
    status: 'empty' | 'uploading' | 'analyzing' | 'verified' | 'error' | 'uploaded' | 'rejected';
    file?: File;
    url?: string;
    previewUrl?: string;
    error?: string;
    source?: 'manual' | 'digilocker';
    extractedData?: any;
}

export interface OnboardingData {
    phoneNumber: string;
    isPhoneVerified: boolean;
    fullName?: string;
    dob?: string;
    gender?: string;
    city?: string;
    locality?: string;
    category?: string;
    experienceYears?: number;
    idType?: 'aadhar' | 'pan';
    idNumber?: string;
    selfie?: string;
    isAgreedToTerms?: boolean;
    guidelinesAccepted?: boolean;
    registrationStatus?: RegistrationStatus;
    documents: {
        [key in DocType]: ProviderDocument;
    };
}

export interface StepProps {
    data: OnboardingData;
    updateData: (update: Partial<OnboardingData>) => void;
    onNext: () => void;
    onBack?: () => void;
}
