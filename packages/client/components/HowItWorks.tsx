import React from 'react';

export const HowItWorks: React.FC = () => {
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
        <div className="py-12 bg-white/50 dark:bg-slate-800/50 rounded-3xl backdrop-blur-sm my-8">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">How It Works</h2>
                <p className="text-slate-600 dark:text-slate-300">Simple steps to get your life sorted.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 px-6">
                {steps.map((step, index) => (
                    <div key={index} className="flex flex-col items-center text-center group">
                        <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/50 rounded-full flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                            {step.icon}
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{step.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400">{step.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
