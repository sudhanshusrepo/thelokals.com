import React, { useEffect, useRef, useState } from 'react';

export const HowItWorks: React.FC = () => {
    const [scrollProgress, setScrollProgress] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                const elementTop = rect.top;
                const elementHeight = rect.height;

                // Calculate progress when element is in viewport
                if (elementTop < windowHeight && elementTop + elementHeight > 0) {
                    const visibleHeight = Math.min(windowHeight - elementTop, elementHeight);
                    const progress = Math.min(Math.max(visibleHeight / elementHeight, 0), 1);
                    setScrollProgress(progress);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const steps = [
        {
            icon: "🔍",
            title: "Search",
            description: "Find the service you need from our wide range of categories."
        },
        {
            icon: "📅",
            title: "Book",
            description: "Choose a professional and schedule a time that works for you."
        },
        {
            icon: "✨",
            title: "Relax",
            description: "Sit back while our verified experts take care of everything."
        }
    ];

    return (
        <div ref={containerRef} className="py-12 bg-white/50 dark:bg-slate-800/50 rounded-3xl backdrop-blur-sm my-8 overflow-hidden">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">How It Works</h2>
                <p className="text-slate-600 dark:text-slate-300">Simple steps to get your life sorted.</p>
            </div>

            {/* Responsive Container */}
            <div className="relative px-4 sm:px-6">
                {/* Animated Connector Line - Hidden on mobile for cleaner look in vertical stack, visible on md+ */}
                <div className="hidden md:block absolute top-8 left-4 right-4 h-1">
                    <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 rounded-full" />
                    <div
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${scrollProgress * 100}%` }}
                    />
                </div>

                {/* Steps Grid - Responsive Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center text-center group relative z-10"
                            style={{
                                opacity: scrollProgress > (index / steps.length) ? 1 : 0.5,
                                transform: `translateY(${scrollProgress > (index / steps.length) ? '0' : '20px'})`,
                                transition: 'all 0.5s ease-out'
                            }}
                        >
                            {/* Icon Circle with Pulse Animation */}
                            <div className={`
                                w-16 h-16 bg-white dark:bg-slate-800 rounded-full 
                                flex items-center justify-center text-3xl mb-4 
                                shadow-lg border-4 
                                ${scrollProgress > (index / steps.length)
                                    ? 'border-teal-500 scale-110'
                                    : 'border-slate-200 dark:border-slate-700'
                                }
                                group-hover:scale-125 transition-all duration-300
                                relative
                            `}>
                                {step.icon}
                                {/* Pulse Ring */}
                                {scrollProgress > (index / steps.length) && (
                                    <div className="absolute inset-0 rounded-full border-2 border-teal-500 animate-ping opacity-75" />
                                )}
                            </div>

                            {/* Step Number Badge */}
                            <div className={`
                                absolute -top-2 left-1/2 -translate-x-1/2 
                                w-8 h-8 rounded-full 
                                flex items-center justify-center 
                                text-xs font-bold text-white
                                ${scrollProgress > (index / steps.length)
                                    ? 'bg-gradient-to-br from-teal-500 to-emerald-500'
                                    : 'bg-slate-400 dark:bg-slate-600'
                                }
                                transition-all duration-300
                            `}>
                                {index + 1}
                            </div>

                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 mt-2">
                                {step.title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm px-4">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
