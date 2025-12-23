'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

// Step Components (to be created)
import { WelcomeStep } from './steps/WelcomeStep';
import { PersonalInfoStep } from './steps/PersonalInfoStep';
import { ProfessionalDetailsStep } from './steps/ProfessionalDetailsStep';
import { DocumentsStep } from './steps/DocumentsStep';
import { BankingStep } from './steps/BankingStep';
import { ReviewStep } from './steps/ReviewStep';

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
    const [currentStep, setCurrentStep] = useState(0);
    const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Auto-save to localStorage
    useEffect(() => {
        const savedData = localStorage.getItem('provider_onboarding');
        if (savedData) {
            setOnboardingData(JSON.parse(savedData));
        }
    }, []);

    useEffect(() => {
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
            // Submit to backend
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

    const steps = [
        <WelcomeStep key="welcome" onNext={nextStep} />,
        <PersonalInfoStep key="personal" data={onboardingData.personalInfo} onUpdate={updateData} onNext={nextStep} onBack={prevStep} />,
        <ProfessionalDetailsStep key="professional" data={onboardingData.professionalDetails} onUpdate={updateData} onNext={nextStep} onBack={prevStep} />,
        <DocumentsStep key="documents" data={onboardingData.documents} onUpdate={updateData} onNext={nextStep} onBack={prevStep} />,
        <BankingStep key="banking" data={onboardingData.banking} onUpdate={updateData} onNext={nextStep} onBack={prevStep} />,
        <ReviewStep key="review" data={onboardingData} onSubmit={handleSubmit} onBack={prevStep} isSubmitting={isSubmitting} />
    ];

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

                {/* Step Content */}
                <div className="animate-fade-in">
                    {steps[currentStep]}
                </div>
            </div>
        </div>
    );
};
