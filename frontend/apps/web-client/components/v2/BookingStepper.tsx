/**
 * BookingStepper Component - V2 Design
 * 4-dot progress indicator for booking flow
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { designTokensV2 } from '@/theme/design-tokens-v2';

export interface BookingStepperProps {
    currentStep: 1 | 2 | 3 | 4;
    steps?: string[];
    className?: string;
}

const DEFAULT_STEPS = ['Package', 'Time', 'Address', 'Review'];

export function BookingStepper({
    currentStep,
    steps = DEFAULT_STEPS,
    className = '',
}: BookingStepperProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`booking-stepper-v2 ${className}`}
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: designTokensV2.spacing.md,
                padding: `${designTokensV2.spacing.xl} 0`,
            }}
        >
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isCompleted = stepNumber < currentStep;

                return (
                    <div
                        key={stepNumber}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: designTokensV2.spacing.xs,
                        }}
                    >
                        {/* Dot */}
                        <motion.div
                            animate={{
                                scale: isActive ? 1.2 : 1,
                                backgroundColor: isCompleted || isActive
                                    ? designTokensV2.colors.gradient.start
                                    : designTokensV2.colors.text.disabled,
                            }}
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: designTokensV2.radius.full,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {isCompleted && (
                                <span style={{ fontSize: '8px', color: 'white' }}>✓</span>
                            )}
                        </motion.div>

                        {/* Label */}
                        <span
                            style={{
                                fontSize: designTokensV2.typography.caption.fontSize,
                                fontWeight: isActive
                                    ? designTokensV2.typography.label.fontWeight
                                    : designTokensV2.typography.caption.fontWeight,
                                color: isActive
                                    ? designTokensV2.colors.text.primary
                                    : designTokensV2.colors.text.tertiary,
                                transition: `all ${designTokensV2.animation.fast} ${designTokensV2.animation.easing.standard}`,
                            }}
                        >
                            {step}
                        </span>
                    </div>
                );
            })}
        </motion.div>
    );
}
