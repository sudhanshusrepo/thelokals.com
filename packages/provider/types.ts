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
  }
  
  export interface StepProps {
    data: OnboardingData;
    updateData: (update: Partial<OnboardingData>) => void;
    onNext: () => void;
    onBack?: () => void;
  }
  