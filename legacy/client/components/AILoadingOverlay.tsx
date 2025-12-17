import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AILoadingOverlayProps {
    isVisible: boolean;
    currentStep: 'idle' | 'transcribing' | 'analyzing' | 'pricing' | 'complete';
    message?: string;
}

export const AILoadingOverlay: React.FC<AILoadingOverlayProps> = ({ isVisible, currentStep, message }) => {
    if (!isVisible && currentStep === 'idle') return null;

    // Mapping steps to visual states
    const steps = [
        { id: 'transcribing', label: 'Processing Input...', icon: '🎙️' },
        { id: 'analyzing', label: 'Analyzing Context...', icon: '🧠' },
        { id: 'pricing', label: 'Calculating Estimates...', icon: '💰' },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === currentStep);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-md p-6"
                >
                    <div className="w-full max-w-md bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700 relative overflow-hidden">
                        {/* Background Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-teal-500/20 blur-3xl rounded-full pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            {/* Dynamic Icon */}
                            <div className="mb-8 relative">
                                <motion.div
                                    key={currentStep}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="w-24 h-24 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-full flex items-center justify-center border border-teal-500/30"
                                >
                                    <span className="text-4xl animate-bounce-subtle">
                                        {currentStep === 'complete' ? '🎉' :
                                            currentStep === 'transcribing' ? '🎙️' :
                                                currentStep === 'pricing' ? '💎' : '🤖'}
                                    </span>
                                </motion.div>

                                {/* Orbiting Particles */}
                                {currentStep !== 'complete' && (
                                    <motion.div
                                        className="absolute inset-0 border-4 border-transparent border-t-teal-500 rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    />
                                )}
                            </div>

                            {/* Status Text */}
                            <h3 className="text-2xl font-bold text-white mb-2 h-8">
                                {message || (
                                    currentStep === 'complete' ? 'Ready!' :
                                        steps[currentStepIndex]?.label || 'Working...'
                                )}
                            </h3>

                            {/* Progress Bars */}
                            <div className="w-full space-y-3 mt-6">
                                {steps.map((step, idx) => {
                                    const isActive = idx === currentStepIndex;
                                    const isCompleted = idx < currentStepIndex || currentStep === 'complete';

                                    return (
                                        <div key={step.id} className="relative">
                                            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                                                <span>{step.label}</span>
                                                {isCompleted && <span className="text-emerald-400">✓</span>}
                                            </div>
                                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    className={`h-full ${isCompleted ? 'bg-emerald-500' : 'bg-teal-500'}`}
                                                    initial={{ width: "0%" }}
                                                    animate={{
                                                        width: isCompleted ? "100%" :
                                                            isActive ? "60%" : "0%"
                                                    }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {currentStep === 'pricing' && (
                                <p className="text-xs text-slate-500 mt-4 animate-pulse">
                                    Finding best rates nearby...
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
