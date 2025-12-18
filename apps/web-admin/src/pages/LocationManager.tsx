import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

interface LocationConfig {
    id: string;
    name: string;
    is_active: boolean;
    service_availability: Record<string, boolean>;
    feature_flags: Record<string, boolean>;
    radius_km: number;
    created_at: string;
}

export default function LocationManager() {
    const [locations, setLocations] = useState<LocationConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);



    const loadLocations = async () => {
        const { data, error } = await supabase
            .from('location_configs')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setLocations(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadLocations();
    }, []);

    const toggleLocationStatus = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('location_configs')
            .update({ is_active: !currentStatus })
            .eq('id', id);

        if (!error) {
            await loadLocations();

            // Log audit
            await supabase.from('admin_audit_logs').insert({
                action: 'location_status_toggle',
                target_table: 'location_configs',
                target_id: id,
                details: { new_status: !currentStatus }
            });
        }
    };

    const toggleService = async (locationId: string, service: string, currentValue: boolean) => {
        const location = locations.find(l => l.id === locationId);
        if (!location) return;

        const newAvailability = {
            ...location.service_availability,
            [service]: !currentValue
        };

        const { error } = await supabase
            .from('location_configs')
            .update({ service_availability: newAvailability })
            .eq('id', locationId);

        if (!error) {
            await loadLocations();

            // Log audit
            await supabase.from('admin_audit_logs').insert({
                action: 'service_availability_toggle',
                target_table: 'location_configs',
                target_id: locationId,
                details: { service, new_value: !currentValue }
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-white">Location Manager</h1>
                        <Link href="/" className="text-slate-400 hover:text-white transition">
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-700">
                        <h2 className="text-xl font-bold text-white">Service Locations</h2>
                        <p className="text-slate-400 text-sm mt-1">Manage service availability by location</p>
                    </div>

                    <div className="divide-y divide-slate-700">
                        {locations.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                No locations configured yet. Add your first location to get started.
                            </div>
                        ) : (
                            locations.map((location) => (
                                <div key={location.id} className="p-6 hover:bg-slate-700/30 transition">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${location.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">{location.name}</h3>
                                                <p className="text-sm text-slate-400">Radius: {location.radius_km} km</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleLocationStatus(location.id, location.is_active)}
                                            className={`px-4 py-2 rounded-lg font-semibold transition ${location.is_active
                                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                }`}
                                        >
                                            {location.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </div>

                                    {/* Service Availability */}
                                    <div className="mt-4">
                                        <p className="text-sm font-semibold text-slate-300 mb-3">Service Availability:</p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {Object.entries(location.service_availability || {}).map(([service, available]) => (
                                                <button
                                                    key={service}
                                                    onClick={() => toggleService(location.id, service, available)}
                                                    className={`p-3 rounded-lg border transition ${available
                                                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                                        : 'bg-slate-700/50 border-slate-600 text-slate-400'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium capitalize">{service}</span>
                                                        <span className="text-xs">{available ? '✓' : '✗'}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Feature Flags */}
                                    {location.feature_flags && Object.keys(location.feature_flags).length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-sm font-semibold text-slate-300 mb-3">Feature Flags:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {Object.entries(location.feature_flags).map(([flag, enabled]) => (
                                                    <span
                                                        key={flag}
                                                        className={`px-3 py-1 rounded-full text-xs font-medium ${enabled
                                                            ? 'bg-purple-500/20 text-purple-400'
                                                            : 'bg-slate-700 text-slate-400'
                                                            }`}
                                                    >
                                                        {flag}: {enabled ? 'ON' : 'OFF'}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <div className="text-2xl">ℹ️</div>
                        <div>
                            <p className="text-blue-400 font-semibold mb-1">Location-Based Control</p>
                            <p className="text-blue-300/80 text-sm">
                                Toggle services on/off for specific locations. Changes take effect immediately for users in those areas.
                                This allows you to gradually roll out services to new cities.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
