'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@thelocals/platform-core';
import { toast } from 'react-hot-toast';

function PhoneAuthContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/';

    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate phone number
            if (!phone || phone.length < 10) {
                throw new Error('Please enter a valid phone number');
            }

            // Format phone with country code if not present
            const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

            // Send OTP via Supabase Auth
            const { error } = await supabase.auth.signInWithOtp({
                phone: formattedPhone,
            });
            if (error) throw error;

            toast.success('OTP sent successfully!');
            setStep('otp');
        } catch (error: any) {
            console.error('OTP Send Error:', error);
            toast.error(error.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate OTP
            if (!otp || otp.length !== 6) {
                throw new Error('Please enter a valid 6-digit OTP');
            }

            const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

            // Verify OTP
            const { error } = await supabase.auth.verifyOtp({
                phone: formattedPhone,
                token: otp,
                type: 'sms'
            });

            if (error) throw error;

            toast.success('Login successful!');
            router.push(redirectTo);
        } catch (error: any) {
            console.error('OTP Verify Error:', error);
            toast.error(error.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-primary mb-2">lokals</h1>
                    <p className="text-slate-600">Trusted Local Services</p>
                </div>

                {/* Auth Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
                    {step === 'phone' ? (
                        <form onSubmit={handleSendOTP} className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome!</h2>
                                <p className="text-slate-600">Enter your phone number to continue</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Phone Number
                                </label>
                                <div className="flex gap-2">
                                    <div className="w-16 px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-medium text-slate-700">
                                        +91
                                    </div>
                                    <input
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        placeholder="98765 43210"
                                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || phone.length < 10}
                                className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                            >
                                {loading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Enter OTP</h2>
                                <p className="text-slate-600">
                                    We sent a code to <span className="font-semibold">+91{phone}</span>
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    6-Digit Code
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="123456"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-center text-2xl tracking-widest font-bold text-slate-900 placeholder:text-slate-400"
                                    maxLength={6}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                            >
                                {loading ? 'Verifying...' : 'Verify & Login'}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setStep('phone');
                                    setOtp('');
                                }}
                                className="w-full text-primary font-medium text-sm hover:text-primary-600 transition-colors"
                            >
                                ← Change Phone Number
                            </button>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-slate-500 mt-6">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
}

export default function PhoneAuth() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <PhoneAuthContent />
        </Suspense>
    );
}
