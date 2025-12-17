import React from 'react';
import { motion } from 'framer-motion';

interface ProcessingAnimationProps {
    message?: string;
    subMessage?: string;
}

export const ProcessingAnimation: React.FC<ProcessingAnimationProps> = ({
    message = "Processing...",
    subMessage = "AI is analyzing your request"
}) => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
            <div className="relative w-64 h-64 flex items-center justify-center mb-8">
                {/* Outer Rotating Ring */}
                <motion.div
                    className="absolute inset-0 border-4 border-transparent border-t-teal-500 border-b-emerald-500 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />

                {/* Inner Rotating Ring (Reverse) */}
                <motion.div
                    className="absolute inset-4 border-4 border-transparent border-l-teal-400 border-r-emerald-400 rounded-full"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />

                {/* Central Pulse */}
                <motion.div
                    className="relative w-32 h-32 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(20,184,166,0.5)]"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <span className="text-4xl">🤖</span>

                    {/* Ripple Effect */}
                    <motion.div
                        className="absolute inset-0 border-2 border-white rounded-full"
                        animate={{ scale: [1, 2], opacity: [1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                    />
                </motion.div>
            </div>

            {/* Text Animations */}
            <motion.h2
                className="text-2xl font-bold text-slate-800 dark:text-white mb-2"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                {message}
            </motion.h2>

            <p className="text-slate-500 dark:text-slate-400 font-mono text-sm">
                {subMessage}
                <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                >...</motion.span>
            </p>
        </div>
    );
};
