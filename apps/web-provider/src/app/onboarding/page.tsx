'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { supabase } from '@thelocals/core/services/supabase';

// Steps
// 1. Personal Details
// 2. Service Selection
// 3. Document Verification (Mock)

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [services, setServices] = useState<any[]>([]);

    // Data
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        city: 'Gurugram',
        selectedService: '',
        aadhaarNumber: '',
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
                        <div className="bg-blue-50 p-4 rounded border border-blue-100">
                            <p className="text-sm text-blue-800">
                                In a production environment, this step would redirect you to DigiLocker to verify your Aadhaar.
                            </p>
                            <p className="text-sm text-blue-800 font-bold mt-2">
                                For MVP Demo: Verification will be auto-approved.
                            </p>
                        </div>

                        <input
                            className="w-full border p-2 rounded"
                            placeholder="Enter Aadhaar Number (Mock)"
                            value={formData.aadhaarNumber}
                            onChange={e => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                        />

                        <div className="flex gap-2 mt-4">
                            <button onClick={() => setStep(2)} className="flex-1 border border-gray-300 p-2 rounded">Back</button>
                            <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-green-600 text-white p-2 rounded">
                                {loading ? 'Submitting...' : 'Complete Registration'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
