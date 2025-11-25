export enum DocType {
    GovtID = 'GovtID',
    PAN = 'PAN',
    Selfie = 'Selfie',
}

export enum RegistrationStatus {
    Incomplete = 'incomplete',
    Pending = 'pending',
    Approved = 'approved',
    Rejected = 'rejected',
}

export interface ProviderDocument {
    type: DocType;
    status: 'empty' | 'uploading' | 'analyzing' | 'verified' | 'error' | 'uploaded';
    file?: File;
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
    idType?: 'aadhar' | 'pan';
    idNumber?: string;
    selfie?: string;
    isAgreedToTerms?: boolean;
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
