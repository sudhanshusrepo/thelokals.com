'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OTPService, OTPConfirmation } from '@thelocals/core/services/otp';
import { toast } from 'react-hot-toast';
import { CONFIG } from '@thelocals/core/config';

export default function AuthClient() {
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [confirmation, setConfirmation] = useState<OTPConfirmation | null>(null);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('[AuthClient] handleSendOtp called with:', phone, 'TestMode:', OTPService.isTestMode());
        if (phone.length < 10) {
            console.log('[AuthClient] Phone validation failed');
            toast.error('Please enter a valid phone number');
            return;
        }
        setLoading(true);
        try {
            console.log('[AuthClient] calling OTPService.sendOTP');
            const confirmObj = await OTPService.sendOTP(phone);
            console.log('[AuthClient] OTPService.sendOTP success');
            setConfirmation(confirmObj);
            setIsOtpSent(true);
            toast.success('OTP sent to ' + phone);
        } catch (error: any) {
            console.error('[AuthClient] Send OTP Error:', error);
            toast.error(error.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirmation) {
            toast.error('Session expired, please resend OTP');
            return;
        }
        if (otp.length !== 6) {
            toast.error('Please enter a 6-digit OTP');
            return;
        }
        setLoading(true);

        try {
            const { session, user } = await confirmation.confirm(otp);

            if (session) {
                toast.success('Login successful!');
                // Check if onboarding is needed (Real check would query provider profile)
                // For now, we push to onboarding by default unless profile exists logic is added.
                // Assuming Next.js middleware handles auth protection.
                router.push('/dashboard');
            } else {
                toast.error('Verification failed: No session created');
            }
        } catch (error: any) {
            console.error('Verify OTP Error:', error);
            toast.error(error.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Provider Login
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    lokals Partner App
                </p>
                <div className="mt-2 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {CONFIG.IS_DEV ? 'Dev Mode' : 'Production'}
                    </span>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {!isOtpSent ? (
                        <form className="space-y-6" onSubmit={handleSendOtp}>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                    Phone Number
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        required
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="+91 98765 43210"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {loading ? 'Sending...' : 'Send OTP'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form className="space-y-6" onSubmit={handleVerifyOtp}>
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                                    Enter OTP sent to {phone}
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        required
                                        maxLength={6}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="123456"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsOtpSent(false)}
                                        className="text-sm text-indigo-600 hover:text-indigo-500"
                                    >
                                        Change Phone Number
                                    </button>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {loading ? 'Verifying...' : 'Verify & Login'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
