'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@thelocals/core/services/supabase';
import Link from 'next/link';

// Icon mapping based on MVP 3.1
const CATEGORY_ICONS: Record<string, string> = {
    'home_maintenance': '🔧',
    'vehicle': '🚗',
    'personal': '📚',
    'default': '⚡'
};

export default function ServiceGrid() {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchServices() {
            // In a real app we would query based on Location (L3_CITY)
            // For MVP we just fetch all enabled globally
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('enabled_globally', true);

            if (data) setServices(data);
            setLoading(false);
        }
        fetchServices();
    }, []);

    if (loading) return <div className="p-4 text-center text-gray-500">Loading services...</div>;

    return (
    return (
        <div className="grid grid-cols-2 gap-4 pb-4">
            {services.map((service) => (
                <Link
                    href={`/service/${service.code}`}
                    key={service.id}
                    className="group block p-4 border border-slate-100 rounded-2xl bg-white hover:border-indigo-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">New</span>
                    </div>

                    <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl mb-3 group-hover:scale-110 group-hover:bg-indigo-50 group-hover:rotate-3 transition-all duration-300">
                        {CATEGORY_ICONS[service.category] || CATEGORY_ICONS['default']}
                    </div>

                    <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-indigo-700 transition-colors">{service.name}</h3>

                    <p className="text-[10px] text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                        {service.description}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                        <p className="text-xs font-bold text-slate-900">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(service.base_price_cents / 100)}
                        </p>
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                            <span className="text-slate-400 text-xs group-hover:text-white">→</span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
    );
}
