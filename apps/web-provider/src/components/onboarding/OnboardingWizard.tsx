'use client';
import React, { Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

// Lazy load heavy components
const WelcomeStep = lazy(() => import('./steps/WelcomeStep').then(m => ({ default: m.WelcomeStep })));
const PersonalInfoStep = lazy(() => import('./steps/PersonalInfoStep').then(m => ({ default: m.PersonalInfoStep })));
const ProfessionalDetailsStep = lazy(() => import('./steps/ProfessionalDetailsStep').then(m => ({ default: m.ProfessionalDetailsStep })));
const DocumentsStep = lazy(() => import('./steps/DocumentsStep').then(m => ({ default: m.DocumentsStep })));
const LocationPermissionStep = lazy(() => import('./steps/LocationPermissionStep').then(m => ({ default: m.LocationPermissionStep })));
const BankingStep = lazy(() => import('./steps/BankingStep').then(m => ({ default: m.BankingStep })));
const ReviewStep = lazy(() => import('./steps/ReviewStep').then(m => ({ default: m.ReviewStep })));

// Loading skeleton component
const StepSkeleton = () => (
    <div className="bg-white rounded-2xl p-8 shadow-lg animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-6"></div>
        <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
        </div>
    </div>
);

interface OnboardingData {
    personalInfo: {
        fullName: string;
        phone: string;
        email: string;
        photo?: string;
    };
    professionalDetails: {
        category: string;
        experienceYears: number;
        serviceArea: string;
        bio: string;
    };
    location?: {
        latitude: number;
        longitude: number;
        address?: string;
    };
    documents: {
        aadhaar?: string;
        photo?: string;
    };
    banking: {
        accountNumber: string;
        ifscCode: string;
        accountHolderName: string;
    };
}

const TOTAL_STEPS = 7;

export const OnboardingWizard: React.FC = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = React.useState(0);
    const [onboardingData, setOnboardingData] = React.useState<Partial<OnboardingData>>({});
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // Auto-save to localStorage
    React.useEffect(() => {
        const savedData = localStorage.getItem('provider_onboarding');
        if (savedData) {
            setOnboardingData(JSON.parse(savedData));
        }
    }, []);

    React.useEffect(() => {
        if (Object.keys(onboardingData).length > 0) {
            localStorage.setItem('provider_onboarding', JSON.stringify(onboardingData));
        }
    }, [onboardingData]);

    const updateData = (stepData: Partial<OnboardingData>) => {
        setOnboardingData(prev => ({ ...prev, ...stepData }));
    };

    const nextStep = () => {
        if (currentStep < TOTAL_STEPS - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (!user) return; // Should not happen given auth guard
        setIsSubmitting(true);
        try {
            // Import supabase here to avoid initialization issues if mocked or not ready
            const { supabase } = await import('@thelocals/core');

            const payload = {
                id: user.id,
                full_name: onboardingData.personalInfo?.fullName,
                phone: onboardingData.personalInfo?.phone,
                email: onboardingData.personalInfo?.email,
                category: onboardingData.professionalDetails?.category,
                experience_years: onboardingData.professionalDetails?.experienceYears,
                service_area: onboardingData.professionalDetails?.serviceArea,
                bio: onboardingData.professionalDetails?.bio,
                latitude: onboardingData.location?.latitude,
                longitude: onboardingData.location?.longitude,
                // In a real app, upload docs to Storage and save URLs here.
                // Assuming base64 for MVP/demo or handling upload in steps.
                verification_documents: onboardingData.documents,
                banking_details: onboardingData.banking,
                verification_status: 'pending',
                registration_completed: true,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('providers')
                .upsert(payload);

            if (error) throw error;

            localStorage.removeItem('provider_onboarding');
            router.push('/verification-pending');
        } catch (error) {
            console.error('Onboarding submission failed:', error);
            // Show toast or error message
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStep = () => {
        const stepProps = {
            onNext: nextStep,
            onBack: prevStep,
            onUpdate: updateData
        };

        switch (currentStep) {
            case 0:
                return <WelcomeStep {...stepProps} />;
            case 1:
                return <PersonalInfoStep data={onboardingData.personalInfo} {...stepProps} />;
            case 2:
                return <ProfessionalDetailsStep data={onboardingData.professionalDetails} {...stepProps} />;
            case 3:
                return <LocationPermissionStep data={onboardingData.location} {...stepProps} />;
            case 4:
                return <DocumentsStep data={onboardingData.documents} {...stepProps} />;
            case 5:
                return <BankingStep data={onboardingData.banking} {...stepProps} />;
            case 6:
                return <ReviewStep data={onboardingData} onSubmit={handleSubmit} onBack={prevStep} isSubmitting={isSubmitting} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-accent/5 to-background py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-primary">
                            Step {currentStep + 1} of {TOTAL_STEPS}
                        </span>
                        <span className="text-sm text-muted">
                            {Math.round(((currentStep + 1) / TOTAL_STEPS) * 100)}% Complete
                        </span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-accent to-primary h-2 rounded-full transition-all duration-500"
                            style={{ width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Step Content with Suspense */}
                <Suspense fallback={<StepSkeleton />}>
                    <div key={currentStep} className="animate-fade-in">
                        {renderStep()}
                    </div>
                </Suspense>
            </div>
        </div>
    );
};
