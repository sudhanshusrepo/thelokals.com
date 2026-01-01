'use client';

import React from 'react';

interface BookingProgressProps {
    currentStep: 1 | 2 | 3 | 4;
}

const steps = [
    { number: 1, label: 'Service', description: 'Select service' },
    { number: 2, label: 'Details', description: 'Booking info' },
    { number: 3, label: 'Provider', description: 'Match & select' },
    { number: 4, label: 'Confirm', description: 'Review & pay' }
];

export const BookingProgress: React.FC<BookingProgressProps> = ({ currentStep }) => {
    return (
        <div className="w-full max-w-3xl mx-auto px-4 py-6">
            {/* Mobile: Compact Progress */}
            <div className="md:hidden">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-primary">
                        Step {currentStep} of 4
                    </span>
                    <span className="text-xs text-muted">
                        {steps[currentStep - 1].label}
                    </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                        className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(currentStep / 4) * 100}%` }}
                    />
                </div>
            </div>

            {/* Desktop: Full Progress Stepper */}
            <div className="hidden md:flex items-center justify-between">
                {steps.map((step, index) => (
                    <React.Fragment key={step.number}>
                        {/* Step Circle */}
                        <div className="flex flex-col items-center relative">
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step.number < currentStep
                                        ? 'bg-accent text-white shadow-lg'
                                        : step.number === currentStep
                                            ? 'bg-gradient-primary text-white shadow-xl scale-110'
                                            : 'bg-slate-200 text-muted'
                                    }`}
                            >
                                {step.number < currentStep ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    step.number
                                )}
                            </div>
                            <div className="mt-2 text-center">
                                <p className={`text-sm font-semibold ${step.number <= currentStep ? 'text-primary' : 'text-muted'}`}>
                                    {step.label}
                                </p>
                                <p className="text-xs text-muted">{step.description}</p>
                            </div>
                        </div>

                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div className="flex-1 h-1 mx-4 relative top-[-24px]">
                                <div className="w-full h-full bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${step.number < currentStep ? 'bg-accent w-full' : 'bg-slate-200 w-0'
                                            }`}
                                    />
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};
