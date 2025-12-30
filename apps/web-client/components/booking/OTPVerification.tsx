'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface OTPVerificationProps {
    otp: string;
    providerName?: string;
    isVerified?: boolean;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
    otp,
    providerName = 'Provider',
    isVerified = false,
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(otp);
            setCopied(true);

            // Haptic feedback (vibration)
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }

            toast.success('OTP copied to clipboard!', {
                icon: '📋',
                duration: 2000,
            });

            setTimeout(() => setCopied(false), 3000);
        } catch (error) {
            toast.error('Failed to copy OTP');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface rounded-2xl p-6 border-2 border-accent-amber shadow-lg"
        >
            <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                    Provider Arrived!
                </h3>
                <p className="text-muted">
                    Share this OTP with {providerName} to start the service
                </p>
            </div>

            {/* OTP Display */}
            <div className="relative mb-6">
                <div className="bg-gradient-to-br from-accent-amber/10 to-warning/10 rounded-xl p-8 border-2 border-accent-amber/30">
                    {/* OTP Digits */}
                    <div className="flex justify-center gap-3 mb-4">
                        {otp.split('').map((digit, index) => (
                            <motion.div
                                key={index}
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                    delay: index * 0.1,
                                    type: 'spring',
                                    stiffness: 200,
                                }}
                                className="w-14 h-16 bg-accent-amber rounded-xl flex items-center justify-center shadow-lg"
                            >
                                <span className="text-3xl font-bold text-secondary">
                                    {digit}
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Copy Button */}
                    <motion.button
                        onClick={handleCopy}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full relative px-6 py-3 bg-accent-amber hover:bg-warning text-secondary font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        {copied ? (
                            <>
                                <CheckCircle2 size={20} />
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy size={20} />
                                <span>Copy OTP</span>
                            </>
                        )}

                        {/* Gold flash animation on copy */}
                        {copied && (
                            <motion.div
                                initial={{ scale: 1, opacity: 1 }}
                                animate={{ scale: 2, opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="absolute inset-0 bg-accent-amber rounded-xl"
                            />
                        )}
                    </motion.button>
                </div>
            </div>

            {/* Verification Status */}
            <div className="text-center">
                {isVerified ? (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="flex items-center justify-center gap-2 text-success"
                    >
                        <CheckCircle2 size={24} />
                        <span className="font-semibold">OTP Verified!</span>
                    </motion.div>
                ) : (
                    <div className="flex items-center justify-center gap-2 text-muted">
                        <div className="w-2 h-2 bg-accent-amber rounded-full animate-pulse" />
                        <span className="text-sm">Waiting for provider to verify...</span>
                    </div>
                )}
            </div>

            {/* Security Note */}
            <div className="mt-4 p-3 bg-neutral-100 rounded-lg">
                <p className="text-xs text-muted text-center">
                    🔒 Never share this OTP with anyone except the provider at your location
                </p>
            </div>
        </motion.div>
    );
};
