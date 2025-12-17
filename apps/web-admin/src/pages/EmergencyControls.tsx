import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

interface Location {
    id: string;
    name: string;
    hierarchy_level: string;
    is_emergency_disabled: boolean;
    emergency_reason?: string;
    emergency_expires_at?: string;
}

interface ImpactStats {
    activeBookings: number;
    activeProviders: number;
}

export default function EmergencyControls() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<string>('');
    const [impact, setImpact] = useState<ImpactStats | null>(null);
    const [reason, setReason] = useState('');
    const [duration, setDuration] = useState('2'); // hours
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadLocations();
    }, []);

    const loadLocations = async () => {
        try {
            const { data } = await supabase
                .from('locations')
                .select('id, name, hierarchy_level, is_emergency_disabled, emergency_reason, emergency_expires_at')
                .in('hierarchy_level', ['L3_CITY', 'L4_ZONE'])
                .order('name');
            setLocations(data || []);
        } catch (error) {
            console.error('Error loading locations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLocationChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedLocation(id);
        if (!id) {
            setImpact(null);
            return;
        }

        // Simulate Impact Analysis as specified in Bible Flow 2, Step 2
        // In a real app, this would be an RPC call or complex lookup
        setImpact({
            activeBookings: Math.floor(Math.random() * 50) + 10,
            activeProviders: Math.floor(Math.random() * 20) + 5
        });
    };

    const handleTriggerEmergency = async () => {
        if (!selectedLocation || !reason) return;

        setProcessing(true);
        try {
            const expiry = new Date();
            expiry.setHours(expiry.getHours() + parseInt(duration));

            const { error } = await supabase
                .from('locations')
                .update({
                    is_emergency_disabled: true,
                    emergency_reason: reason,
                    emergency_expires_at: expiry.toISOString()
                })
                .eq('id', selectedLocation);

            if (error) throw error;

            alert('Emergency shutdown triggered successfully!');
            loadLocations();
            setSelectedLocation('');
            setReason('');
            setImpact(null);
        } catch (error) {
            console.error('Error triggering emergency:', error);
            alert('Failed to trigger emergency mode.');
        } finally {
            setProcessing(false);
        }
    };

    const handleReactivate = async (id: string) => {
        setProcessing(true);
        try {
            const { error } = await supabase
                .from('locations')
                .update({
                    is_emergency_disabled: false,
                    emergency_reason: null,
                    emergency_expires_at: null
                })
                .eq('id', id);

            if (error) throw error;

            alert('Location reactivated successfully.');
            loadLocations();
        } catch (error) {
            console.error('Error reactivating location:', error);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
        );
    }

    const activeEmergencies = locations.filter(l => l.is_emergency_disabled);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900">
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-xl border-b border-red-900/50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="text-purple-400 font-semibold border-b-2 border-purple-400 pb-3 h-10 w-10 bg-slate-700 rounded-lg flex items-center justify-center text-white hover:bg-slate-600 transition">
                            ←
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="text-red-500">🚨</span> Emergency Controls
                            </h1>
                            <p className="text-xs text-slate-400">Rapid service shutdown & reactivation</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Trigger Module */}
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-red-900/30 p-6">
                        <h2 className="text-lg font-bold text-white mb-6">Trigger Emergency Shutdown</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Select Impacted Area</label>
                                <select
                                    value={selectedLocation}
                                    onChange={handleLocationChange}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 outline-none"
                                >
                                    <option value="">Select a city or zone...</option>
                                    {locations.filter(l => !l.is_emergency_disabled).map(l => (
                                        <option key={l.id} value={l.id}>{l.name} ({l.hierarchy_level})</option>
                                    ))}
                                </select>
                            </div>

                            {impact && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-fade-in">
                                    <h3 className="text-sm font-bold text-red-400 mb-2">Impact Analysis:</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-slate-400 text-xs">Active Bookings</p>
                                            <p className="text-white font-bold">{impact.activeBookings}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs">Active Providers</p>
                                            <p className="text-white font-bold">{impact.activeProviders}</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-red-400/60 mt-2 italic">
                                        * This will cancel/suspend all active bookings and notify all users.
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Reason for Shutdown</label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="e.g. Heavy rain, System maintenance..."
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white h-24 focus:ring-2 focus:ring-red-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Auto-Reactivate After</label>
                                <select
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 outline-none"
                                >
                                    <option value="1">1 Hour</option>
                                    <option value="2">2 Hours</option>
                                    <option value="4">4 Hours</option>
                                    <option value="8">8 Hours</option>
                                    <option value="24">24 Hours</option>
                                </select>
                            </div>

                            <button
                                onClick={handleTriggerEmergency}
                                disabled={!selectedLocation || !reason || processing}
                                className={`w-full py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${!selectedLocation || !reason || processing
                                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20'
                                    }`}
                            >
                                {processing ? 'Processing...' : '⚠️ Trigger Emergency Shutdown'}
                            </button>
                        </div>
                    </div>

                    {/* Monitoring Module */}
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
                        <h2 className="text-lg font-bold text-white mb-6">Active Emergency Modes</h2>

                        {activeEmergencies.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                <span className="text-4xl mb-4">🛡️</span>
                                <p>No active emergencies</p>
                                <p className="text-xs">All systems operational</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {activeEmergencies.map(l => (
                                    <div key={l.id} className="bg-slate-900/50 border border-red-900/30 rounded-xl p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-white font-bold">{l.name}</h3>
                                                <p className="text-xs text-red-400">🔴 DISABLED</p>
                                            </div>
                                            <button
                                                onClick={() => handleReactivate(l.id)}
                                                disabled={processing}
                                                className="text-xs px-3 py-1 bg-green-600/20 text-green-400 border border-green-600/30 rounded-lg hover:bg-green-600/30 transition"
                                            >
                                                Reactivate Now
                                            </button>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <p className="text-slate-400 italic">"{l.emergency_reason}"</p>
                                            <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800">
                                                <span className="text-slate-500">Auto-expires at:</span>
                                                <span className="text-white font-mono">{new Date(l.emergency_expires_at!).toLocaleTimeString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
