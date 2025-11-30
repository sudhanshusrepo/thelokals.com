import React, { useState, useEffect } from 'react';
import { ChatInput } from './ChatInput';
import { useNavigate } from 'react-router-dom';

interface StickyChatCtaProps {
    serviceCategory?: string;
    onSend?: (content: { type: 'text' | 'audio' | 'video', data: string | Blob }) => void;
    placeholder?: string;
}

export const StickyChatCta: React.FC<StickyChatCtaProps> = ({ serviceCategory, onSend, placeholder }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progressStep, setProgressStep] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        // If we are on a service page (serviceCategory is present), always show it
        if (serviceCategory) {
            setIsVisible(true);
            return;
        }

        // Otherwise (Landing Page), show when scrolled down
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            // Appear only when the user starts scrolling after scrolled down (e.g. > 100px)
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
        setProgressStep(0);

        // Simulate processing steps
        const steps = [
            "Analyzing your request...",
            "Checking availability...",
            "Estimating costs...",
            "Finding the best pros..."
        ];

        let step = 0;
        const interval = setInterval(() => {
            step++;
            setProgressStep(step);

            if (step >= steps.length) {
                clearInterval(interval);
                setIsProcessing(false);

                if (onSend) {
                    onSend(content);
                } else {
                    // Generic flow from Landing Page
                    console.log("Generic AI request processed:", content);
                    // TODO: Navigate to results or booking flow
                    // For now, we'll just alert to show the flow is complete
                    alert("The Lokals AI has found 3 pros for you! (Demo)");
                }
            }
        }, 800);
    };

    if (!isVisible) return null;

    return (
        <>
            {/* Processing / Progress Overlay */}
            {isProcessing && (
                <div className="fixed bottom-28 left-4 right-4 z-50 animate-fade-in-up flex justify-center pointer-events-none">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-4 border border-teal-100 dark:border-teal-900/50 flex items-center gap-4 w-full max-w-md pointer-events-auto">
                        <div className="relative flex-shrink-0">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-teal-600">AI</div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                                {serviceCategory ? `Finding ${serviceCategory} pros...` : "The Lokals AI is finding the best pros..."}
                            </p>
                            <p className="text-xs text-slate-500 animate-pulse truncate">
                                {["Analyzing request...", "Checking availability...", "Estimating costs...", "Finalizing matches..."][Math.min(progressStep, 3)]}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <ChatInput
                onSend={handleInputSend}
                isLoading={isProcessing}
                hideMedia={true}
                className="!bottom-[72px] sm:!bottom-0 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] transition-all duration-300"
                placeholder={placeholder || "Try Lokals AI..."}
            />
        </>
    );
};
