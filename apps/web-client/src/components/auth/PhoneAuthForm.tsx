'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Loader2, ArrowRight } from 'lucide-react';
import { Button, Input } from '@thelocals/ui-web';

export function PhoneAuthForm() {
    const router = useRouter();
    const supabase = createClient();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/';

    const [formState, setFormState] = useState<'PHONE' | 'OTP'>('PHONE');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (phone.length < 10) throw new Error('Invaild phone number');

            const { error } = await supabase.auth.signInWithOtp({
                phone: `+91${phone}`,
            });

            if (error) throw error;

            toast.success('OTP sent successfully');
            setFormState('OTP');
        } catch (err: any) {
            toast.error(err.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (otp.length !== 6) throw new Error('Invalid OTP');

            const { error } = await supabase.auth.verifyOtp({
                phone: `+91${phone}`,
                token: otp,
                type: 'sms'
            });

            if (error) throw error;

            toast.success('Logged in successfully');
            router.push(redirectTo);
            router.refresh();
        } catch (err: any) {
            toast.error(err.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {formState === 'PHONE' ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                        <div className="flex gap-2">
                            <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 font-medium text-gray-600 flex items-center justify-center select-none">
                                +91
                            </div>
                            <Input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                className="flex-1 bg-gray-50 border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-900 focus:border-lokals-green focus:bg-white placeholder:text-gray-300 h-12"
                                placeholder="99999 99999"
                                autoFocus
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading || phone.length < 10}
                        className="w-full bg-black text-white rounded-xl py-6 font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] h-12"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <>Continue <ArrowRight size={18} /></>}
                    </Button>

                    <p className="text-xs text-center text-gray-400 mt-4">
                        By continuing you agree to our Terms & Privacy Policy.
                    </p>
                </form>
            ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div className="text-center mb-4">
                        <p className="text-sm text-gray-600">Enter OTP sent to <span className="font-bold">+91 {phone}</span></p>
                        <button type="button" onClick={() => setFormState('PHONE')} className="text-xs text-lokals-green font-bold mt-1 hover:underline">Change Number</button>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">One Time Password</label>
                        <Input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 font-bold text-center text-2xl tracking-[0.5em] text-gray-900 focus:border-lokals-green focus:bg-white placeholder:text-gray-300 h-14"
                            placeholder="000000"
                            autoFocus
                            maxLength={6}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading || otp.length !== 6}
                        variant="lokalsPrimary"
                        className="w-full rounded-xl py-6 font-bold hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-[0.98] h-12"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Verify & Login'}
                    </Button>
                </form>
            )}
        </div>
    );
}
