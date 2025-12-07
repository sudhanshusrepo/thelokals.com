import React, { useState, useEffect } from 'react';

interface OTPVerificationFormProps {
    phoneNumber: string;
    onVerifyOTP: (code: string) => Promise<void>;
    onResendOTP: () => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

export const OTPVerificationForm: React.FC<OTPVerificationFormProps> = ({
    phoneNumber,
    onVerifyOTP,
    onResendOTP,
    onCancel,
    loading = false
}) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    // Countdown timer for resend
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendTimer]);

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return; // Only allow single digit
        if (value && !/^\d$/.test(value)) return; // Only allow numbers

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }

        // Auto-submit when all 6 digits are entered
        if (newOtp.every(digit => digit !== '') && index === 5) {
            handleSubmit(newOtp.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
        setOtp(newOtp);

        // Auto-submit if 6 digits pasted
        if (pastedData.length === 6) {
            handleSubmit(pastedData);
        }
    };

    const handleSubmit = async (code?: string) => {
        const otpCode = code || otp.join('');
        if (otpCode.length !== 6) {
            setError('Please enter the complete 6-digit OTP');
            return;
        }

        setError('');
        try {
            await onVerifyOTP(otpCode);
        } catch (err: any) {
            setError(err.message || 'Invalid OTP. Please try again.');
            setOtp(['', '', '', '', '', '']);
            document.getElementById('otp-0')?.focus();
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        setError('');
        setOtp(['', '', '', '', '', '']);
        setResendTimer(60);
        setCanResend(false);

        try {
            await onResendOTP();
        } catch (err: any) {
            setError(err.message || 'Failed to resend OTP');
        }
    };

    return (
        <div className="space-y-4">
            <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Verify OTP
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Enter the 6-digit code sent to
                </p>
                <p className="text-sm font-medium text-teal-600 dark:text-teal-400">
                    {phoneNumber}
                </p>
            </div>

            <div className="flex justify-center gap-2" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-12 text-center text-xl font-bold border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                        disabled={loading}
                        autoFocus={index === 0}
                    />
                ))}
            </div>

            {error && (
                <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
            )}

            <div className="text-center">
                {canResend ? (
                    <button
                        type="button"
                        onClick={handleResend}
                        className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
                        disabled={loading}
                    >
                        Resend OTP
                    </button>
                ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Resend OTP in {resendTimer}s
                    </p>
                )}
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={() => handleSubmit()}
                    className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || otp.some(digit => !digit)}
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Verifying...
                        </span>
                    ) : (
                        'Verify OTP'
                    )}
                </button>
            </div>
        </div>
    );
};
