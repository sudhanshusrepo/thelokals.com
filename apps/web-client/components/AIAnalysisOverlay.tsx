'use client';

import React from 'react';

interface AIAnalysisOverlayProps {
    isVisible: boolean;
    step: number;
    steps: string[];
    onClose: () => void;
    isComplete: boolean;
}

export const AIAnalysisOverlay: React.FC<AIAnalysisOverlayProps> = ({ isVisible, step, steps, onClose, isComplete }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in">
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
                        {isComplete ? "Pros Found!" : "thelokals AI is working..."}
                    </h3>
                    <p className="text-slate-400 mb-8 h-6 flex items-center justify-center">
                        {isComplete
                            ? "We've found top-rated professionals for you."
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
