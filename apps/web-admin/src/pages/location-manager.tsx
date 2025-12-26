import { useEffect, useState } from 'react';
import { supabase } from '@thelocals/core/services/supabase';
import { adminService } from '@thelocals/core/services/adminService';
import { LocationConfig, ServiceCategory } from '@thelocals/core/types';
import Link from 'next/link';
import { Plus, X, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LocationManager() {
    const [locations, setLocations] = useState<LocationConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Navigation State
    const [viewLevel, setViewLevel] = useState<'L3_CITY' | 'L4_AREA' | 'L5_PINCODE'>('L3_CITY');
    const [parentLocation, setParentLocation] = useState<LocationConfig | null>(null);

    const [editingLocation, setEditingLocation] = useState<Partial<LocationConfig>>({
        hierarchy_level: 'L3_CITY',
        is_active: true,
        radius_km: 10
    });
    const [saving, setSaving] = useState(false);

    const loadLocations = async () => {
        setLoading(true);
        try {
            // Fetch locations based on current level and parent
            const locationsData = await adminService.getLocations(viewLevel, parentLocation?.id);

            // Fetch service availability - optimizing to fetch only relevant availabilities would be better,
            // but for now reusing the bulk fetch for simplicity, or we can fetch by parent context if possible.
            // adminService.getServiceAvailability usually pulls all or by city. 
            // If viewing areas, we might need a more granular fetch or client-side filter.
            // For robust prototype, let's fetch all availability records for visible locations.

            // To be accurate, let's just fetch ALL availability for now and map in memory.
            const availabilityData = await adminService.getServiceAvailability();

            const servicesData = await adminService.getServiceCategories();

            const mappedLocations: LocationConfig[] = locationsData.map((loc) => {
                const locAvailability: Record<string, boolean> = {};

                servicesData.forEach((service) => {
                    const availabilityRecord = availabilityData.find(
                        (a) => a.service_category_id === service.id && a.location_value === loc.name
                    );
                    locAvailability[service.name] = availabilityRecord?.status !== 'DISABLED';
                });

                return {
                    ...loc,
                    service_availability: locAvailability,
                };
            });

            setLocations(mappedLocations);
        } catch (error) {
            console.error('Failed to load locations:', error);
            toast.error("Failed to load locations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLocations();
    }, [viewLevel, parentLocation]);

    const handleNavigateDown = (location: LocationConfig) => {
        if (location.hierarchy_level === 'L3_CITY') {
            setParentLocation(location);
            setViewLevel('L4_AREA');
        } else if (location.hierarchy_level === 'L4_AREA') {
            setParentLocation(location);
            setViewLevel('L5_PINCODE');
        }
    };

    const handleNavigateUp = () => {
        if (viewLevel === 'L5_PINCODE') {
            // Need to find grandparent... complicated without state history.
            // For 2 levels (City -> Area), going up means back to City.
            // If 3 levels, we assume strict hierarchy.
            // Ideally we should track a simplified navigation stack.
            // Let's implement simple Back:
            // If Area -> Go to City (Parent = null)
            // If Pincode -> Go to Area (Parent = parent's parent? We don't have it easily).
            // For now, let's stick to L3 -> L4 support as per plan for robust start.
            // If needed, we can re-fetch parent details.
        }

        // Simple 2-level support:
        if (viewLevel === 'L4_AREA') {
            setParentLocation(null);
            setViewLevel('L3_CITY');
        }
    };

    const toggleLocationStatus = async (id: string, currentStatus: boolean) => {
        try {
            const loc = locations.find(l => l.id === id);
            if (loc) {
                await adminService.upsertLocation({ ...loc, is_active: !currentStatus });
                loadLocations();
                toast.success(`Location ${!currentStatus ? 'activated' : 'deactivated'}`);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    // ... toggleService implementation is largely same, ensuring we use generic update logic ...
    const toggleService = async (locationId: string, serviceName: string, currentValue: boolean) => {
        // Reuse existing logic, just re-implemented for clarity in new structure
        const location = locations.find(l => l.id === locationId);
        if (!location) return;

        const { data: serviceData } = await supabase.from('service_categories').select('id').eq('name', serviceName).single();
        if (!serviceData) return toast.error("Service config not found");

        const newStatus = currentValue ? 'DISABLED' : 'ENABLED';
        try {
            await adminService.toggleServiceAvailability(
                serviceData.id, location.name, newStatus, 'admin', 'Manual toggle'
            );

            // Optimistic
            setLocations(prev => prev.map(l => {
                if (l.id === locationId) {
                    return {
                        ...l,
                        service_availability: { ...l.service_availability, [serviceName]: newStatus === 'ENABLED' }
                    };
                }
                return l;
            }));
            toast.success(`Service ${newStatus.toLowerCase()}`);
        } catch (error: any) { toast.error(error.message); }
    };

    const handleSaveLocation = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Ensure proper hierarchy and parent linkage
            const payload = {
                ...editingLocation,
                hierarchy_level: viewLevel, // Force current level
                parent_id: parentLocation?.id || undefined // Force current context parent
            };

            await adminService.upsertLocation(payload);
            toast.success("Location saved");
            setIsModalOpen(false);
            loadLocations();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const openAddModal = () => {
        setEditingLocation({
            hierarchy_level: viewLevel,
            is_active: true,
            radius_km: viewLevel === 'L3_CITY' ? 10 : 3, // Smaller default for areas
            parent_id: parentLocation?.id
        });
        setIsModalOpen(true);
    }

    if (loading && locations.length === 0) {
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
                        <div className="flex items-center gap-4">
                            <Link href="/" className="text-slate-400 hover:text-white transition">
                                ← Back
                            </Link>
                            <div className="flex items-center gap-2 text-white">
                                <h1 className="text-2xl font-bold">Location Manager</h1>
                                {parentLocation && (
                                    <>
                                        <span className="text-slate-500">/</span>
                                        <button onClick={handleNavigateUp} className="text-purple-400 hover:underline">
                                            {parentLocation.name}
                                        </button>
                                        <span className="text-slate-500">/</span>
                                        <span>Areas</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={openAddModal}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            <Plus size={18} />
                            Add {viewLevel === 'L3_CITY' ? 'City' : 'Area'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden">
                    {/* ... List of locations ... */}
                    <div className="divide-y divide-slate-700">
                        {locations.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                No {viewLevel === 'L3_CITY' ? 'cities' : 'areas'} found. Add one to get started.
                            </div>
                        ) : (
                            locations.map((location) => (
                                <div key={location.id} className="p-6 hover:bg-slate-700/30 transition">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${location.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                                    {location.name}
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-normal">
                                                        {location.hierarchy_level.replace('L3_', '').replace('L4_', '')}
                                                    </span>
                                                </h3>
                                                <p className="text-sm text-slate-400">Radius: {location.radius_km} km</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {location.hierarchy_level === 'L3_CITY' && (
                                                <button
                                                    onClick={() => handleNavigateDown(location)}
                                                    className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 transition"
                                                >
                                                    Manage Areas
                                                </button>
                                            )}
                                            <button
                                                onClick={() => toggleLocationStatus(location.id, location.is_active)}
                                                className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${location.is_active
                                                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                    : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                    }`}
                                            >
                                                {location.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </div>
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
                                                        <span className="text-sm font-medium capitalize truncate mr-2" title={service}>{service}</span>
                                                        <span className="text-xs">{available ? '✓' : '✗'}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-900/50">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <MapPin size={18} className="text-purple-400" />
                                {editingLocation.id ? 'Edit' : 'Add'} {viewLevel === 'L3_CITY' ? 'City' : 'Area'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveLocation} className="p-6 space-y-4">
                            {parentLocation && (
                                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-sm text-purple-300">
                                    Adding Area to: <span className="font-bold text-purple-200">{parentLocation.name}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder={viewLevel === 'L3_CITY' ? "e.g. Mumbai" : "e.g. Bandra West"}
                                    value={editingLocation.name || ''}
                                    onChange={e => setEditingLocation({ ...editingLocation, name: e.target.value })}
                                    className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Service Radius (km)</label>
                                <input
                                    type="number"
                                    required
                                    min="0.5"
                                    step="0.5"
                                    value={editingLocation.radius_km || (viewLevel === 'L3_CITY' ? 10 : 3)}
                                    onChange={e => setEditingLocation({ ...editingLocation, radius_km: parseFloat(e.target.value) })}
                                    className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={editingLocation.is_active}
                                    onChange={e => setEditingLocation({ ...editingLocation, is_active: e.target.checked })}
                                    className="rounded border-slate-600 bg-slate-900 text-purple-600 focus:ring-purple-500"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-slate-300">Active immediately</label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 shadow-lg shadow-purple-900/20 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
