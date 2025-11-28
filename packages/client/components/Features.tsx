import React from 'react';

export const Features: React.FC = () => {
    const features = [
        {
            title: "Verified Professionals",
            description: "Every expert is vetted and background-checked for your safety."
        },
        {
            title: "Secure Payments",
            description: "Pay safely through our platform after the job is done."
        },
        {
            title: "24/7 Support",
            description: "Our dedicated support team is always here to help you."
        },
        {
            title: "Satisfaction Guarantee",
            description: "Not happy? We'll make it right, guaranteed."
        }
    ];

    return (
        <div className="py-12">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Why Choose Us?</h2>
                <p className="text-slate-600 dark:text-slate-300">We bring you the best local services.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                    <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-slate-100 dark:border-slate-700">
                        <div className="h-2 w-12 bg-teal-500 rounded-full mb-4"></div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{feature.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
