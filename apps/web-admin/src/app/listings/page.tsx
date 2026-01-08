'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Plus, Edit2, Trash2, X, MapPin, Power } from 'lucide-react';
import { adminService, ServiceCategory, ServiceLocation } from "@thelocals/platform-core";
import { ServiceCategoryTable } from '../../components/listings/ServiceCategoryTable';
import { toast } from 'react-hot-toast';

export default function Listings() {
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [locations, setLocations] = useState<ServiceLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCity, setSelectedCity] = useState<string>('Gurugram'); // Default for Sprint 1
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Partial<ServiceCategory>>({});
    const [saving, setSaving] = useState(false);

    // Hardcoded for Sprint 1, in future fetch from DB
    const AVAILABLE_CITIES = ['Gurugram', 'New Delhi', 'Navi Mumbai', 'Bangalore'];

    useEffect(() => {
        loadData();
    }, [selectedCity]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [cats, locs] = await Promise.all([
                adminService.getServiceCategories(),
                adminService.getServiceLocations(selectedCity)
            ]);
            setCategories(cats);
            setLocations(locs);
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await adminService.upsertServiceCategory(editingCategory);
            toast.success("Category saved successfully");
            setIsModalOpen(false);
            loadData();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This might affect existing bookings if not handled safely.")) return;
        try {
            await adminService.deleteServiceCategory(id);
            toast.success("Category deleted");
            loadData();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleToggleAvailability = async (category: ServiceCategory) => {
        const locationConfig = locations.find(l => l.service_category_id === category.id);
        const isEnabled = locationConfig?.is_active || false;

        // Optimistic update
        const newStatus = !isEnabled;

        // Payload for API (Must not have temp ID)
        const apiPayload: any = {
            service_category_id: category.id,
            location_name: selectedCity,
            city: selectedCity,
            is_active: newStatus,
            production_mode: true,
            updated_at: new Date().toISOString()
        };

        if (locationConfig?.id) {
            apiPayload.id = locationConfig.id;
        } else {
            apiPayload.created_at = new Date().toISOString();
        }

        // Local state update (Can have temp ID for UI consistency if needed, though mostly unused)
        const localLocConfig = {
            ...apiPayload,
            id: locationConfig?.id || 'temp-' + Date.now(),
        };

        // Update local state immediately
        const updatedLocations = [...locations];
        const existingIndex = updatedLocations.findIndex(l => l.service_category_id === category.id);
        if (existingIndex >= 0) {
            updatedLocations[existingIndex] = { ...updatedLocations[existingIndex], is_active: newStatus };
        } else {
            updatedLocations.push(localLocConfig as ServiceLocation);
        }
        setLocations(updatedLocations);

        try {
            await adminService.upsertServiceLocation(apiPayload);
            toast.success(`${category.name} is now ${newStatus ? 'Active' : 'Disabled'} in ${selectedCity}`);

            // Reload to get real ID if it was a new creation
            if (!locationConfig?.id) {
                loadData();
            }
        } catch (error: any) {
            console.error('Toggle failed:', error);
            toast.error("Failed to update status");
            loadData(); // Revert on error
        }
    };

    const openModal = (category: Partial<ServiceCategory> = { type: 'local' }) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Service Catalogue</h1>
                    <p className="text-sm text-neutral-500">Manage services and availability per city.</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* City Context Selector */}
                    <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-neutral-200 rounded-lg bg-white text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none hover:border-neutral-300 transition-colors"
                        >
                            {AVAILABLE_CITIES.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>

                    <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors font-medium" onClick={() => openModal()}>
                        <Plus size={18} />
                        <span>Add Service</span>
                    </button>
                </div>
            </div>

            <ServiceCategoryTable
                categories={categories}
                locations={locations}
                loading={loading}
                selectedCity={selectedCity}
                onEdit={openModal}
                onDelete={handleDelete}
                onToggleStatus={handleToggleAvailability}
            />

            {/* Edit Modal - Only for creating base categories, not availability */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
                            <h3 className="font-bold text-neutral-900">
                                {editingCategory.id ? 'Edit Service' : 'Add New Service'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-500 mb-1">Service Name</label>
                                <input
                                    type="text"
                                    required
                                    value={editingCategory.name || ''}
                                    onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                    className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-500 mb-1">Type</label>
                                <select
                                    value={editingCategory.type || 'local'}
                                    onChange={e => setEditingCategory({ ...editingCategory, type: e.target.value as 'local' | 'online' })}
                                    className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                >
                                    <option value="local">Local (Physical)</option>
                                    <option value="online">Online (Remote)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-500 mb-1">Description</label>
                                <textarea
                                    value={editingCategory.description || ''}
                                    onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value })}
                                    className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[100px]"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
