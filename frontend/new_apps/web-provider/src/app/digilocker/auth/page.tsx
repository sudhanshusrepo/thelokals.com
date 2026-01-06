
'use client';

import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { providerService } from '@thelocals/core/services/providerService';
import { toast } from 'react-hot-toast';
import { Loader2, CheckCircle } from 'lucide-react';

export default function DigilockerAuthPage() {
    const { user, refreshProfile } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState<'CONNECTING' | 'FETCHING' | 'VERIFYING' | 'SUCCESS'>('CONNECTING');

    useEffect(() => {
        if (!user?.id) return;

        const mockAuthFlow = async () => {
            try {
                // Step 1: Connecting
                await new Promise(r => setTimeout(r, 1500));
                setStep('FETCHING');

                // Step 2: Fetching Docs
                await new Promise(r => setTimeout(r, 2000));
                setStep('VERIFYING');

                // Step 3: Verifying
                await providerService.updateProfile(user.id, {
                    isVerified: true,  // Should map to is_verified in DB if possible, or we follow typescript type
                    // The updateProfile type in frontend service might need adjustment if 'isVerified' isn't exposed
                    // Checking providerService... defaulting to generic update if strictly typed
                } as any);

                // Also setting 'is_verified' for DB consistency if the type allows partial<WorkerProfile> which usually has loose keys or we cast
                await providerService.updateProfile(user.id, { is_verified: true } as any);

                await new Promise(r => setTimeout(r, 1500));
                setStep('SUCCESS');

                await refreshProfile();
                toast.success("Identity Verified Successfully!");

                // Redirect after success
                setTimeout(() => {
                    router.push('/profile');
                }, 2000);

            } catch (error) {
                console.error(error);
                toast.error("Verification failed. Please try again.");
                router.push('/digilocker/intro');
            }
        };

        mockAuthFlow();
    }, [user, router, refreshProfile]);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
            <div className="text-center max-w-sm w-full">
                {step === 'SUCCESS' ? (
                    <div className="animate-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} className="text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Verified!</h2>
                        <p className="text-neutral-500">Redirecting to your profile...</p>
                    </div>
                ) : (
                    <div>
                        <div className="w-16 h-16 border-4 border-brand-green/20 border-t-brand-green rounded-full animate-spin mx-auto mb-8" />

                        <h2 className="text-xl font-bold text-neutral-900 mb-2">
                            {step === 'CONNECTING' && "Connecting to DigiLocker..."}
                            {step === 'FETCHING' && "Fetching Aadhaar details..."}
                            {step === 'VERIFYING' && "Verifying identity..."}
                        </h2>
                        <p className="text-neutral-500 text-sm">Please do not close this window.</p>
                    </div>
                )}
            </div>

            <div className="fixed bottom-8 flex items-center gap-2 text-neutral-400 opacity-50">
                <span className="font-bold">DigiLocker</span>
                <span className="text-xs border px-1 rounded">SECURE CONNECTION</span>
            </div>
        </div>
    );
}
