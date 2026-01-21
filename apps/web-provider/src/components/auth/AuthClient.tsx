'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OTPService, OTPConfirmation, CONFIG } from "@thelocals/platform-core";
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, ShieldCheck, Phone, ArrowRight } from 'lucide-react';

export default function AuthClient() {
    const router = useRouter();
    const { verifyOtp } = useAuth();
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [confirmation, setConfirmation] = useState<OTPConfirmation | null>(null);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (phone.length < 10) {
            toast.error('Please enter a valid phone number');
            return;
        }
        setLoading(true);
        try {
            const formattedPhone = `+91${phone}`;
            const confirmObj = await OTPService.sendOTP(formattedPhone);
            setConfirmation(confirmObj);
            setIsOtpSent(true);
            toast.success('OTP sent to ' + phone);
        } catch (error: any) {
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
            await verifyOtp(confirmation, otp);
            toast.success('Login successful!');
            router.push('/dashboard'); // Go to dashboard
        } catch (error: any) {
            toast.error(error.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-brand-gradient rounded-2xl shadow-xl overflow-hidden border border-neutral-100">
                <div className="px-8 pt-8 pb-6 text-center">
                    <div className="w-16 h-16 bg-white/50 backdrop-blur-sm text-neutral-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <ShieldCheck size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-900">Provider Partner</h2>
                    <p className="text-neutral-800 mt-1 font-medium">Login to manage your jobs</p>
                </div>

                <div className="px-8 pb-8">
                    {!isOtpSent ? (
                        <form className="space-y-4" onSubmit={handleSendOtp}>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-bold text-neutral-800 mb-1">
                                    Phone Number
                                </label>
                                <div className="flex gap-2">
                                    <div className="w-16 px-3 py-2.5 bg-white border border-neutral-200 rounded-lg text-center font-bold text-neutral-900 flex items-center justify-center shadow-sm">
                                        +91
                                    </div>
                                    <input
                                        id="phone"
                                        type="tel"
                                        required
                                        autoFocus
                                        className="block flex-1 px-3 py-2.5 bg-white border border-neutral-200 rounded-lg focus:ring-primary focus:border-primary transition-colors shadow-sm font-bold text-neutral-900 placeholder:text-neutral-400"
                                        placeholder="98765 43210"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || phone.length < 10}
                                className="w-full py-3 px-4 bg-primary hover:bg-primary-600 text-white font-bold rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                        Send OTP <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form className="space-y-4" onSubmit={handleVerifyOtp}>
                            <div>
                                <label htmlFor="otp" className="block text-sm font-bold text-neutral-800 mb-1">
                                    Enter OTP
                                </label>
                                <div className="text-center mb-4">
                                    <p className="text-sm text-neutral-800 font-medium">Sent to +91 {phone}</p>
                                </div>
                                <input
                                    id="otp"
                                    type="text"
                                    required
                                    autoFocus
                                    maxLength={6}
                                    className="block w-full px-3 py-2.5 bg-white border border-neutral-200 rounded-lg focus:ring-primary focus:border-primary transition-colors text-center text-lg tracking-widest font-bold text-neutral-900 shadow-sm"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsOtpSent(false)}
                                        className="text-xs text-neutral-900 hover:text-neutral-700 font-bold underline"
                                    >
                                        Change Phone Number
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 bg-primary hover:bg-primary-600 text-white font-bold rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Verify & Login'}
                            </button>
                        </form>
                    )}
                </div>

                <div className="bg-white/30 backdrop-blur-md px-8 py-4 border-t border-white/20 text-center">
                    <p className="text-xs text-neutral-800 font-medium">
                        {CONFIG.IS_DEV ? 'Development Mode' : 'Secure Login'}
                    </p>
                </div>
            </div>
        </div>
    );
}
