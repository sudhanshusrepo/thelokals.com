import React, { useState, useEffect } from 'react';
import { Stepper } from './Stepper';
import { PhoneStep } from './steps/PhoneStep';
import { BasicDetailsStep } from './steps/BasicDetailsStep';
import { DocumentStep } from './steps/DocumentStep';
import { GuidelinesStep } from './steps/GuidelinesStep';
import { ReviewStep } from './steps/ReviewStep';
import { ServiceSelectionStep } from './steps/ServiceSelectionStep';
import { ProviderProfile, RegistrationStatus, DocType } from '../types';
import { backend } from '../services/backend';
import { Header } from './Header';

interface RegistrationWizardProps {
    onComplete: () => void;
    onCancel: () => void;
}

const initialData: ProviderProfile = {
    phoneNumber: '',
    isPhoneVerified: false,
    fullName: '',
    dob: '',
    gender: '',
    city: '',
    locality: '',
    documents: {
        [DocType.GovtID]: { type: DocType.GovtID, status: 'empty' },
        [DocType.PAN]: { type: DocType.PAN, status: 'empty' },
        [DocType.BankDetails]: { type: DocType.BankDetails, status: 'empty' },
        [DocType.Selfie]: { type: DocType.Selfie, status: 'empty' }
    },
    guidelinesAccepted: false,
    registrationStatus: RegistrationStatus.Draft
};

export const RegistrationWizard: React.FC<RegistrationWizardProps> = ({ onComplete, onCancel }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<ProviderProfile>(initialData);
    const [isRestoring, setIsRestoring] = useState(true);

    const totalSteps = 6; // Phone, Basic Details, Services, Documents, Guidelines, Review

    // Restore draft on load
    useEffect(() => {
        const loadDraft = async () => {
            const draft = await backend.db.getDraft();
            if (draft) {
                setFormData(prev => ({
                    ...prev,
                    ...draft,
                    documents: { ...prev.documents, ...draft.documents }
                }));
                if (draft.isPhoneVerified) {
                    setStep(2); // Jump to next step if phone verified
                }
            }
            setIsRestoring(false);
        };
        loadDraft();
    }, []);

    // Auto-save draft
    useEffect(() => {
        if (isRestoring) return;

        const timeout = setTimeout(() => {
            backend.db.saveDraft(formData);
        }, 1000);

        return () => clearTimeout(timeout);
    }, [formData, isRestoring]);

    const updateData = (updates: Partial<ProviderProfile>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleComplete = async () => {
        // Submit registration
        try {
            await backend.submitRegistration(formData);
            await backend.db.clearDraft();
            onComplete();
        } catch (error) {
            console.error('Registration submission failed:', error);
            alert('Failed to submit registration. Please try again.');
        }
    };

    if (isRestoring) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header title="Provider Registration" showAutoSaving={true} />

            <div className="flex-1 flex flex-col items-center py-6 sm:py-12 px-4">
                <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-[600px]">

                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
                        <button
                            onClick={onCancel}
                            className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </button>
                        <div className="text-sm font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                            Step {step} of {totalSteps}
                        </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                        <Stepper currentStep={step} totalSteps={totalSteps} />

                        <div className="flex-1 mt-6">
                            {step === 1 && <PhoneStep data={formData} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
                            {step === 2 && <BasicDetailsStep data={formData} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
                            {step === 3 && <ServiceSelectionStep data={formData} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
                            {step === 4 && <DocumentStep data={formData} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
                            {step === 5 && <GuidelinesStep data={formData} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
                            {step === 6 && <ReviewStep data={formData} updateData={updateData} onNext={handleComplete} onBack={prevStep} />}
                        </div>
                    </div>

                    <div className="bg-slate-50 px-6 py-3 text-center text-xs text-slate-400 border-t border-slate-100">
                        Secure 256-bit Connection • Auto-saving enabled
                    </div>
                </div>
            </div>
        </div>
    );
};
