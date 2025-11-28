import React, { useState, useEffect } from 'react';
import { Landing } from './components/Landing';
import { Stepper } from './components/Stepper';
import { PhoneStep } from './components/steps/PhoneStep';
import { BasicDetailsStep } from './components/steps/BasicDetailsStep';
import { DocumentStep } from './components/steps/DocumentStep';
import { GuidelinesStep } from './components/steps/GuidelinesStep';
import { ReviewStep } from './components/steps/ReviewStep';
import { ProviderProfile, RegistrationStatus, DocType } from './types';
import { backend } from './services/backend';
import { ToastProvider, useToast } from './components/Toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/Header';

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

const MainApp = () => {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ProviderProfile>(initialData);
  const [isRestoring, setIsRestoring] = useState(true);
  const toast = useToast();
  const auth = useAuth();

  // Restore draft on load
  useEffect(() => {
    const loadDraft = async () => {
      const draft = await backend.db.getDraft();
      if (draft) {
        setFormData(prev => ({
          ...prev,
          ...draft,
          // Ensure document objects are merged correctly if schema changed
          documents: { ...prev.documents, ...draft.documents }
        }));
        if (draft.isPhoneVerified) {
          setStarted(true);
          setStep(2); // Jump to next step if logged in
        }
      }
      setIsRestoring(false);
    };
    loadDraft();
  }, []);

  // Auto-save draft
  useEffect(() => {
    if (!started || isRestoring) return;

    const timeout = setTimeout(() => {
      backend.db.saveDraft(formData);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [formData, started, isRestoring]);

  const updateData = (updates: Partial<ProviderProfile>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  if (isRestoring || auth.loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!started) {
    return <Landing onStart={() => setStarted(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#f0fdf4] flex flex-col items-center py-6 sm:py-12">
      <div className="w-full max-w-lg bg-white sm:rounded-2xl sm:shadow-xl overflow-hidden min-h-screen sm:min-h-[600px] flex flex-col">

        <Header title="Registration" showAutoSaving={true} />

        <div className="p-6 flex-1 flex flex-col">
          <Stepper currentStep={step} totalSteps={5} />

          <div className="flex-1">
            {step === 1 && <PhoneStep data={formData} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
            {step === 2 && <BasicDetailsStep data={formData} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
            {step === 3 && <DocumentStep data={formData} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
            {step === 4 && <GuidelinesStep data={formData} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
            {step === 5 && <ReviewStep data={formData} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-3 text-center text-xs text-slate-400 border-t border-slate-100">
          Step {step} of 5 • Secure 256-bit Connection
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
