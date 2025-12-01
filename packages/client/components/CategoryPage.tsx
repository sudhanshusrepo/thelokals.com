import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface CategoryPageProps {
    title: string;
    description: string;
    services: string[];
    icon?: string;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
    title,
    description,
    services,
    icon = "✨"
}) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20 pb-12 px-4">
            <Helmet>
                <title>{title} | thelokals.com</title>
                <meta name="description" content={description} />
                <meta property="og:title" content={`${title} | thelokals.com`} />
                <meta property="og:description" content={description} />
            </Helmet>

            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="text-6xl mb-4">{icon}</div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        {title}
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        {description}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((service, index) => (
                        <motion.div
                            key={service}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 cursor-pointer hover:border-teal-500 transition-colors"
                            onClick={() => navigate('/chat')}
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                                    {service}
                                </h3>
                                <span className="text-teal-500">Book Now →</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};
