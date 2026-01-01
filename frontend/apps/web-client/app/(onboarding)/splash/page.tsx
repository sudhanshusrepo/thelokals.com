'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { designTokensV2 } from '../../../theme/design-tokens-v2';

export default function SplashPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect logic:
        // In a real app, check if user has seen onboarding or is logged in
        // For now, simple timeout to intro
        const timer = setTimeout(() => {
            const hasSeenOnboarding = localStorage.getItem('lokals_has_seen_onboarding');
            if (hasSeenOnboarding) {
                router.push('/');
            } else {
                router.push('/intro');
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div
            style={{
                height: '100vh',
                width: '100vw',
                background: designTokensV2.colors.gradient.css,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: designTokensV2.spacing.xl,
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                {/* Logo Placeholder - simplistic SVG or text for now */}
                <h1 style={{
                    fontSize: '48px',
                    fontWeight: 800,
                    color: '#fff',
                    marginBottom: designTokensV2.spacing.md,
                    fontFamily: 'Poppins, sans-serif'
                }}>
                    lokals
                </h1>
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                style={{
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '18px',
                    fontWeight: 500,
                    fontFamily: 'Poppins, sans-serif'
                }}
            >
                AI-Powered Home Services
            </motion.p>
        </div>
    );
}
