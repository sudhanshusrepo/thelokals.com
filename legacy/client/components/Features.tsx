import React from 'react';

export const Features: React.FC = () => {
    const features = [
        {
            icon: "✓",
            title: "Verified Professionals",
            description: "Every expert is vetted and background-checked for your safety.",
            gradient: "from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20",
            iconBg: "bg-teal-100 dark:bg-teal-900/30",
            iconColor: "text-teal-600 dark:text-teal-400"
        },
        {
            icon: "🔒",
            title: "Secure Payments",
            description: "Pay safely through our platform with multiple payment options.",
            gradient: "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
            iconBg: "bg-blue-100 dark:bg-blue-900/30",
            iconColor: "text-blue-600 dark:text-blue-400"
        },
        {
            icon: "💬",
            title: "24/7 Support",
            description: "Our dedicated support team is always here to help you.",
            gradient: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
            iconBg: "bg-purple-100 dark:bg-purple-900/30",
            iconColor: "text-purple-600 dark:text-purple-400"
        },
        {
            icon: "⭐",
            title: "Satisfaction Guarantee",
            description: "Not happy? We'll make it right, guaranteed.",
            gradient: "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
            iconBg: "bg-amber-100 dark:bg-amber-900/30",
            iconColor: "text-amber-600 dark:text-amber-400"
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
                    <div
                        key={index}
                        className={`
                            relative p-6 rounded-2xl 
                            bg-gradient-to-br ${feature.gradient}
                            shadow-[0_8px_30px_rgba(0,0,0,0.08)] 
                            dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]
                            border border-slate-100/50 dark:border-slate-700/30
                            backdrop-blur-sm
                            transition-all duration-300 
                            hover:-translate-y-2 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]
                            group
                        `}
                    >
                        {/* Icon Circle */}
                        <div className={`
                            w-14 h-14 rounded-full flex items-center justify-center 
                            ${feature.iconBg} 
                            mb-4 
                            shadow-md
                            group-hover:scale-110 transition-transform duration-300
                        `}>
                            <span className={`text-2xl ${feature.iconColor}`}>{feature.icon}</span>
                        </div>

                        {/* Content */}
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                            {feature.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {feature.description}
                        </p>

                        {/* Decorative gradient line */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};
