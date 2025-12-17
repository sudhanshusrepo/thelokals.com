
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SERVICE_GROUPS, CATEGORY_ICONS, CATEGORY_DISPLAY_NAMES } from '../constants';
import { WorkerCategory } from '../types';
import NotFound from './NotFound';
import { StickyChatCta } from './StickyChatCta';

import { Helmet } from 'react-helmet-async';

export const GroupDetailPage: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();
    const group = Object.values(SERVICE_GROUPS).find(g => g.name === groupId);

    if (!group) {
        return <NotFound />;
    }

    return (
        <div className="animate-fade-in-up px-0" data-testid="group-detail-page">
            <Helmet>
                <title>{group.name} Services - thelokals.com</title>
                <meta name="description" content={`Find top-rated ${group.name.toLowerCase()} professionals. ${group.categories.map(c => CATEGORY_DISPLAY_NAMES[c as WorkerCategory]).join(', ')}. Book instantly with AI on thelokals.com.`} />
                <meta name="keywords" content={`${group.name.toLowerCase()}, ${group.categories.map(c => CATEGORY_DISPLAY_NAMES[c as WorkerCategory].toLowerCase()).join(', ')}, local services, thelokals`} />
            </Helmet>
            <div className="text-center py-4 sm:py-8">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 sm:mb-4">
                    {group.name}
                </h1>
                <p className="text-md sm:text-lg text-slate-600 dark:text-slate-300">
                    Select a service to get an AI-powered estimate and checklist.
                </p>
            </div>

            <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
                {group.categories.map(category => (
                    <button
                        key={category}
                        data-testid={`category-button-${category.toLowerCase()}`}
                        onClick={() => navigate(`/schedule?category=${category.toLowerCase()}`)}
                        className="relative flex flex-col items-center justify-center p-3 sm:p-6
                            bg-white dark:bg-slate-800
                            rounded-xl sm:rounded-2xl
                            shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]
                            hover:shadow-[0_20px_30px_-10px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_30px_-10px_rgba(0,0,0,0.4)]
                            border border-slate-100 dark:border-slate-700
                            hover:border-teal-500/50 dark:hover:border-teal-400/50
                            group overflow-hidden
                            min-h-[120px] sm:min-h-[180px]
                            transform-gpu perspective-1000
                            hover:scale-105 hover:-translate-y-2
                            transition-all duration-300"
                    >
                        {/* Background Gradient Hover Effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-teal-50/50 to-transparent dark:from-teal-900/10"></div>

                        <span className="relative z-10 text-3xl sm:text-4xl mb-2 sm:mb-3 text-teal-600 dark:text-teal-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                            {CATEGORY_ICONS[category as WorkerCategory]}
                        </span>
                        <span className="relative z-10 text-sm sm:text-base font-bold text-center text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                            {CATEGORY_DISPLAY_NAMES[category as WorkerCategory]}
                        </span>
                    </button>
                ))}
            </div>
            <StickyChatCta serviceCategory={group.name} />
        </div>
    );
};
