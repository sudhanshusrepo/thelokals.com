'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { supabase } from '@thelocals/core/services/supabase';
import { DigiLockerModal } from '../../components/DigiLockerModal';

// Steps
// 1. Personal Details
// 2. Service Selection
// 3. Document Verification (DigiLocker)

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [services, setServices] = useState<any[]>([]);
    const [showDigiLocker, setShowDigiLocker] = useState(false);

    // Data
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        city: 'Gurugram',
        selectedService: '',
        aadhaarNumber: '',
        verification_status: 'pending',
        verificationUrl: ''
    });

    // Fetch services on load
    useEffect(() => {
        const fetchServices = async () => {
            const { data, error } = await supabase.from('services').select('*').eq('enabled_globally', true);
            if (data) setServices(data);
        };
        fetchServices();
    }, []);

    const handleNext = () => {
        if (step === 1 && (!formData.fullName || !formData.email)) {
            toast.error('Please fill all details');
            return;
        }
        if (step === 2 && !formData.selectedService) {
            toast.error('Please select a service');
            return;
        }
        setStep(step + 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) throw new Error("No user found");

            const updateData = {
                full_name: formData.fullName,
                email: formData.email,
                // provider-specific fields
                category: formData.selectedService, // In real app, this maps to code
                is_active: true, // Auto-activate for MVP
                is_verified: true, // Mock verification
                verification_status: 'verified',
                registration_completed: true
            };

            // In a real app we would INSERT into providers table if not exists
            // simplified for MVP Phase 1
            const { error } = await supabase
                .from('providers')
                .upsert({
                    id: user.id,
                    ...updateData,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            toast.success("Welcome Boarding Complete!");
            router.push('/dashboard');

        } catch (e: any) {
            toast.error(e.message || "Failed to onboard");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Partner Onboarding</h2>

                {/* Progress Bar */}
                <div className="flex mb-8">
                    <div className={`flex-1 h-2 rounded-l ${step >= 1 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                    <div className={`flex-1 h-2 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                    <div className={`flex-1 h-2 rounded-r ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                </div>

                {step === 1 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Personal Details</h3>
                        <input
                            className="w-full border p-2 rounded"
                            placeholder="Full Name"
                            value={formData.fullName}
                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                        />
                        <input
                            className="w-full border p-2 rounded"
                            placeholder="Email Address"
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                        <select
                            className="w-full border p-2 rounded"
                            value={formData.city}
                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                        >
                            <option value="Gurugram">Gurugram</option>
                            <option value="Bhopal">Bhopal</option>
                        </select>
                        <button onClick={handleNext} className="w-full bg-indigo-600 text-white p-2 rounded mt-4">Next</button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Select Your Service</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {services.map(s => (
                                <div
                                    key={s.id}
                                    onClick={() => setFormData({ ...formData, selectedService: s.code })}
                                    className={`p-3 border rounded cursor-pointer ${formData.selectedService === s.code ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
                                >
                                    <div className="font-semibold">{s.name}</div>
                                    <div className="text-xs text-gray-500">{s.description}</div>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => setStep(1)} className="flex-1 border border-gray-300 p-2 rounded">Back</button>
                            <button onClick={handleNext} className="flex-1 bg-indigo-600 text-white p-2 rounded">Next</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">DigiLocker Verification</h3>

                        {!formData.verificationUrl ? (
                            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 text-center">
                                <div className="mb-4">
                                    <svg className="w-12 h-12 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-bold text-blue-900 mb-2">Verify Identity with DigiLocker</h4>
                                <p className="text-sm text-blue-700 mb-6">
                                    Connect your DigiLocker account to instantly verify your Aadhaar and PAN.
                                    This is required to activate your provider account.
                                </p>
                                <button
                                    onClick={() => setShowDigiLocker(true)}
                                    className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition shadow-lg w-full sm:w-auto"
                                >
                                    Connect DigiLocker
                                </button>
                            </div>
                        ) : (
                            <div className="bg-green-50 p-6 rounded-lg border border-green-100 text-center animate-in fade-in">
                                <div className="mb-4">
                                    <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                                        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                <h4 className="text-lg font-bold text-green-900 mb-1">Verification Successful</h4>
                                <p className="text-sm text-green-700 mb-4">
                                    Your identity has been verified via DigiLocker.
                                </p>
                                <p className="text-xs text-slate-500 truncate max-w-xs mx-auto mb-6">
                                    Proof: {formData.verificationUrl}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-2 mt-4">
                            <button onClick={() => setStep(2)} className="flex-1 border border-gray-300 p-2 rounded">Back</button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !formData.verificationUrl}
                                className="flex-1 bg-green-600 text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Submitting...' : 'Complete Registration'}
                            </button>
                        </div>

                        <DigiLockerModal
                            isOpen={showDigiLocker}
                            onClose={() => setShowDigiLocker(false)}
                            onSuccess={(data: any) => {
                                setFormData({
                                    ...formData,
                                    verification_status: 'verified',
                                    verificationUrl: data.url
                                });
                                setShowDigiLocker(false);
                                toast.success('Identity Verified Successfully!');
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
