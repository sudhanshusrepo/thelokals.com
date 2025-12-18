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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {services.map((service) => (
                <Link
                    href={`/service/${service.code}`}
                    key={service.id}
                    className="block p-4 border rounded-xl hover:shadow-lg transition-shadow bg-white"
                >
                    <div className="text-3xl mb-2">
                        {CATEGORY_ICONS[service.category] || CATEGORY_ICONS['default']}
                    </div>
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <p className="text-xs text-green-600 mt-1">
                        Starts ₹{service.base_price_cents / 100}
                    </p>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                        {service.description}
                    </p>
                </Link>
            ))}
        </div>
    );
}
