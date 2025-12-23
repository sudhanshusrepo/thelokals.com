'use client';
import React, { Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

// Lazy load heavy components
const WelcomeStep = lazy(() => import('./steps/WelcomeStep').then(m => ({ default: m.WelcomeStep })));
const PersonalInfoStep = lazy(() => import('./steps/PersonalInfoStep').then(m => ({ default: m.PersonalInfoStep })));
const ProfessionalDetailsStep = lazy(() => import('./steps/ProfessionalDetailsStep').then(m => ({ default: m.ProfessionalDetailsStep })));
const DocumentsStep = lazy(() => import('./steps/DocumentsStep').then(m => ({ default: m.DocumentsStep })));
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

const TOTAL_STEPS = 6;

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
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/provider/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(onboardingData)
            });

            if (response.ok) {
                localStorage.removeItem('provider_onboarding');
                router.push('/verification-pending');
            }
        } catch (error) {
            console.error('Onboarding submission failed:', error);
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
                return <DocumentsStep data={onboardingData.documents} {...stepProps} />;
            case 4:
                return <BankingStep data={onboardingData.banking} {...stepProps} />;
            case 5:
                return <ReviewStep data={onboardingData} onSubmit={handleSubmit} onBack={prevStep} isSubmitting={isSubmitting} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F5F7FB] to-white py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[#0A2540]">
                            Step {currentStep + 1} of {TOTAL_STEPS}
                        </span>
                        <span className="text-sm text-[#64748B]">
                            {Math.round(((currentStep + 1) / TOTAL_STEPS) * 100)}% Complete
                        </span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-[#12B3A6] to-[#0A2540] h-2 rounded-full transition-all duration-500"
                            style={{ width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Step Content with Suspense */}
                <Suspense fallback={<StepSkeleton />}>
                    <div className="animate-fade-in">
                        {renderStep()}
                    </div>
                </Suspense>
            </div>
        </div>
    );
};
