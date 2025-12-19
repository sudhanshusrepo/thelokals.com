'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function TutorialPage() {
    const router = useRouter();
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            id: 0,
            title: "Find Services in Seconds",
            description: "Browse 20+ services like Plumbing, Electrical, and Repair. Book verified professionals instantly.",
            icon: "🔍",
            bgColor: "bg-blue-50"
        },
        {
            id: 1,
            title: "Verified Providers Only",
            description: "Every provider is verified via DigiLocker. Check ratings, reviews, and tier status before you book.",
            icon: "✅",
            bgColor: "bg-indigo-50"
        },
        {
            id: 2,
            title: "Guaranteed Payment",
            description: "Your money is safe. We hold payments until the job is done perfectly. Full refund guarantee.",
            icon: "🛡️",
            bgColor: "bg-green-50"
        }
    ];

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else {
            completeTutorial();
        }
    };

    const completeTutorial = () => {
        // Set a cookie or local storage to mark tutorial as seen
        localStorage.setItem('has_seen_tutorial', 'true');
        router.push('/');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-between py-12 px-6 bg-white overflow-hidden">
            {/* Skip Button */}
            <div className="w-full flex justify-end">
                <button
                    onClick={completeTutorial}
                    className="text-slate-400 font-medium text-sm hover:text-slate-600 transition-colors"
                >
                    Skip
                </button>
            </div>

            {/* Carousel Content */}
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center text-center"
                    >
                        {/* Icon/Image Placeholder */}
                        <div className={`w-64 h-64 rounded-3xl ${slides[currentSlide].bgColor} flex items-center justify-center text-8xl shadow-sm mb-12`}>
                            {slides[currentSlide].icon}
                        </div>

                        <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
                            {slides[currentSlide].title}
                        </h1>
                        <p className="text-slate-500 text-lg leading-relaxed px-4">
                            {slides[currentSlide].description}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="w-full max-w-md flex flex-col items-center gap-8">
                {/* Pagination Dots */}
                <div className="flex gap-2">
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? "w-8 bg-blue-600" : "w-2 bg-slate-200"
                                }`}
                        />
                    ))}
                </div>

                {/* Buttons */}
                <button
                    onClick={handleNext}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] transition-all active:scale-95"
                >
                    {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
                </button>
            </div>
        </div>
    );
}
