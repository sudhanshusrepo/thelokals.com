
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SERVICE_GROUPS, CATEGORY_ICONS, CATEGORY_DISPLAY_NAMES } from '../constants';
import { WorkerCategory } from '../types';
import NotFound from './NotFound';

export const GroupDetailPage: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();
    const group = Object.values(SERVICE_GROUPS).find(g => g.name === groupId);

    if (!group) {
        return <NotFound />;
    }

    return (
        <div className="animate-fade-in-up px-4">
            <div className="text-center py-4 sm:py-8">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 sm:mb-4">
                    {group.name}
                </h1>
                <p className="text-md sm:text-lg text-slate-600 dark:text-slate-300">
                    Select a service to get an AI-powered estimate and checklist.
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {group.categories.map(category => (
                    <button
                        key={category}
                        onClick={() => navigate(`/schedule?category=${category.toLowerCase()}`)}
                        className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 p-4 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-600/50 transition-all duration-300 h-28 sm:h-32 group shadow-md hover:shadow-lg hover:-translate-y-1 border border-slate-100 dark:border-slate-700"
                    >
                        <span className="text-3xl sm:text-4xl mb-2 sm:mb-3 text-teal-600">{CATEGORY_ICONS[category as WorkerCategory]}</span>
                        <span className="text-sm sm:text-md font-semibold text-center text-slate-700 dark:text-slate-300 group-hover:text-teal-700">
                            {CATEGORY_DISPLAY_NAMES[category as WorkerCategory]}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};
