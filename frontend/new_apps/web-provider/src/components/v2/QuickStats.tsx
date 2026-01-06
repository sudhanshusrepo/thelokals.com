
'use client';

import { Briefcase, CheckCircle, Star } from 'lucide-react';

interface QuickStatsProps {
    activeJobs: number;
    completedToday: number;
    rating: number;
}

export const QuickStats = ({ activeJobs, completedToday, rating }: QuickStatsProps) => {
    const stats = [
        { label: 'Active Jobs', value: activeJobs, color: 'text-blue-600', bg: 'bg-blue-50', icon: Briefcase },
        { label: 'Completed Today', value: completedToday, color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
        { label: 'Rating', value: rating, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Star },
    ];

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-visible">
            {stats.map((stat, i) => (
                <div key={i} className="min-w-[140px] flex-1 bg-white p-4 rounded-xl shadow-sm border border-neutral-100 flex flex-col items-center text-center">
                    <div className={`p-2 rounded-full mb-2 ${stat.bg} ${stat.color}`}>
                        <stat.icon size={20} />
                    </div>
                    <span className="text-2xl font-extrabold text-neutral-900">{stat.value}</span>
                    <span className="text-xs text-neutral-500 font-medium">{stat.label}</span>
                </div>
            ))}
        </div>
    );
};
