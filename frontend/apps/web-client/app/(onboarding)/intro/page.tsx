'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { designTokensV2 } from '../../../theme/design-tokens-v2';
import { HeroCard } from '../../../components/v2/HeroCard';

const ONBOARDING_STEPS = [
    {
        id: 1,
        title: "Services Assigned Instantly",
        subtitle: "No more scrolling through lists. Our AI assigns the best provider for you instantly.",
        cta: "Next",
        variant: "gradient" as const
    },
    {
        id: 2,
        title: "Transparent Pricing",
        subtitle: "Know exactly what you pay. No hidden charges or last-minute surprises.",
        cta: "Next",
        variant: "dark" as const
    },
    {
        id: 3,
        title: "Live Tracking",
        subtitle: "Track your provider in real-time. See exactly when they'll arrive.",
        cta: "Get Started",
        variant: "light" as const
    }
];

export default function IntroPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < ONBOARDING_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Finish onboarding
            localStorage.setItem('lokals_has_seen_onboarding', 'true');
            router.push('/');
        }
    };

    const stepData = ONBOARDING_STEPS[currentStep];

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: designTokensV2.spacing.lg,
            backgroundColor: '#fff',
            overflow: 'hidden'
        }}>
            {/* Top Indicator */}
            <div style={{ display: 'flex', gap: '8px', paddingTop: '20px' }}>
                {ONBOARDING_STEPS.map((_, idx) => (
                    <div
                        key={idx}
                        style={{
                            height: '4px',
                            flex: 1,
                            borderRadius: '2px',
                            backgroundColor: idx <= currentStep
                                ? designTokensV2.colors.gradient.start
                                : '#E0E0E0',
                            transition: 'background-color 0.3s ease'
                        }}
                    />
                ))}
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        style={{ width: '100%', maxWidth: '400px' }}
                    >
                        <HeroCard
                            title={stepData.title}
                            subtitle={stepData.subtitle}
                            variant={stepData.variant}
                            cta1={{
                                label: stepData.cta,
                                onClick: handleNext,
                                variant: 'secondary'
                            }}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '20px' }}>
                {currentStep < ONBOARDING_STEPS.length - 1 && (
                    <button
                        onClick={() => {
                            localStorage.setItem('lokals_has_seen_onboarding', 'true');
                            router.push('/');
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#9E9E9E',
                            fontSize: '14px',
                            fontFamily: 'Poppins, sans-serif',
                            cursor: 'pointer'
                        }}
                    >
                        Skip
                    </button>
                )}
            </div>
        </div>
    );
}
