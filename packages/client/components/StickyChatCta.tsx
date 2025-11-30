import React, { useState, useEffect } from 'react';
import { ChatInput } from './ChatInput';
import { useNavigate } from 'react-router-dom';

interface StickyChatCtaProps {
    serviceCategory?: string;
    onSend?: (content: { type: 'text' | 'audio' | 'video', data: string | Blob }) => void;
    placeholder?: string;
}

import React, { useState, useEffect } from 'react';
import { ChatInput } from './ChatInput';
import { useNavigate } from 'react-router-dom';

interface StickyChatCtaProps {
    serviceCategory?: string;
    onSend?: (content: { type: 'text' | 'audio' | 'video', data: string | Blob }) => void;
    placeholder?: string;
}

const AIAnalysisOverlay: React.FC<{
    isVisible: boolean;
    step: number;
    steps: string[];
    onClose: () => void;
    isComplete: boolean;
}> = ({ isVisible, step, steps, onClose, isComplete }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in">
            <div className="w-full max-w-md bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-teal-500/20 blur-3xl rounded-full pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    {/* Icon / Spinner */}
                    <div className="mb-8 relative">
                        {isComplete ? (
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center animate-bounce-small">
                                <span className="text-4xl">🎉</span>
                            </div>
                        ) : (
                            <>
                                <div className="w-20 h-20 bg-teal-500/10 rounded-full flex items-center justify-center">
                                    <span className="text-3xl animate-pulse">🤖</span>
                                </div>
                                <div className="absolute inset-0 border-4 border-teal-500/30 rounded-full animate-spin-slow border-t-teal-500"></div>
                            </>
                        )}
                    </div>

                    {/* Text Content */}
                    <h3 className="text-2xl font-bold text-white mb-2">
                        {isComplete ? "Pros Found!" : "Lokals AI is working..."}
                    </h3>
                    <p className="text-slate-400 mb-8 h-6">
                        {isComplete
                            ? "We've found 3 top-rated professionals for you."
                            : steps[Math.min(step, steps.length - 1)]}
                    </p>

                    {/* Progress Bar */}
                    {!isComplete && (
                        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-8">
                            <div
                                className="h-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-500 ease-out"
                                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                            ></div>
                        </div>
                    )}

                    {/* Action Button */}
                    {isComplete && (
                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg transform transition hover:scale-[1.02] active:scale-95"
                        >
                            View Matches
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export const StickyChatCta: React.FC<StickyChatCtaProps> = ({ serviceCategory, onSend, placeholder }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progressStep, setProgressStep] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const navigate = useNavigate();

    const steps = [
        "Analyzing your request...",
        "Identifying service category...",
        "Checking provider availability...",
        "Calculating estimated costs...",
        "Curating the best matches..."
    ];

    useEffect(() => {
        if (serviceCategory) {
            setIsVisible(true);
            return;
        }

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > 100) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [serviceCategory]);

    const handleInputSend = (content: { type: 'text' | 'audio' | 'video', data: string | Blob }) => {
        setIsProcessing(true);
        setIsComplete(false);
        setProgressStep(0);

        let step = 0;
        const interval = setInterval(() => {
            step++;
            setProgressStep(step);

            if (step >= steps.length) {
                clearInterval(interval);
                setIsComplete(true);

                if (onSend) {
                    // If a custom handler is provided, call it after a delay
                    setTimeout(() => {
                        setIsProcessing(false);
                        onSend(content);
                    }, 1500);
                }
            }
        }, 1200); // Slightly slower for better UX
    };

    const handleCloseOverlay = () => {
        setIsProcessing(false);
        setIsComplete(false);
        // Here you would typically navigate to a results page
        // navigate('/results'); 
    };

    if (!isVisible) return null;

    return (
        <>
            <AIAnalysisOverlay
                isVisible={isProcessing}
                step={progressStep}
                steps={steps}
                onClose={handleCloseOverlay}
                isComplete={isComplete}
            />

            {/* Enhanced AI Chat Bar */}
            <div className={`fixed bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-white via-white to-transparent dark:from-slate-900 dark:via-slate-900 z-40 transition-transform duration-300 ${isProcessing ? 'translate-y-full' : 'translate-y-0'}`}>
                <div className="max-w-3xl mx-auto relative group">
                    {/* Glowing Effect Background */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>

                    <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden">

                        {/* AI Badge Header */}
                        <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-800 px-4 py-1.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                                    Lokals AI Assistant
                                </span>
                            </div>
                            {serviceCategory && (
                                <span className="text-[10px] text-slate-400 font-medium">
                                    Context: {serviceCategory}
                                </span>
                            )}
                        </div>

                        <ChatInput
                            onSend={handleInputSend}
                            isLoading={false} // We handle loading with the overlay now
                            hideMedia={false}
                            className="!relative !bottom-auto !left-auto !right-auto !bg-transparent !border-0 !shadow-none !p-2"
                            placeholder={placeholder || "Ask anything... e.g., 'Book a cleaner for tomorrow'"}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};
