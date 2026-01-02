import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Plus, Edit2, Trash2, Filter, Save, X } from 'lucide-react';
import { adminService } from '@thelocals/core/services/adminService';
import { ServiceCategory } from '@thelocals/core/types';
import { toast } from 'react-hot-toast';

export default function Listings() {
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Partial<ServiceCategory>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const data = await adminService.getServiceCategories();
            setCategories(data);
        } catch (error) {
            toast.error("Failed to load categories");
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
            loadCategories();
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
            loadCategories();
        } catch (error: any) {
            toast.error(error.message);
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
                    <h1 className="text-2xl font-bold text-text-primary">Service Catalogue</h1>
                    <p className="text-sm text-text-secondary">Manage global service definitions and base pricing.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-primary" onClick={() => openModal()}>
                        <Plus size={18} />
                        <span>Add Service</span>
                    </button>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Name</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Type</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Description</th>
                                <th className="text-right py-3 px-4 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-text-secondary">Loading catalogue...</td>
                                </tr>
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-text-secondary">No services found. Add one to get started.</td>
                                </tr>
                            ) : (
                                categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4">
                                            <span className="font-medium text-text-primary">{cat.name}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${cat.type === 'local' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {cat.type?.toUpperCase() || 'UNKNOWN'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-text-secondary max-w-md truncate">
                                            {cat.description || '-'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openModal(cat)}
                                                    className="p-1 hover:bg-gray-200 rounded text-text-secondary hover:text-primary transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat.id)}
                                                    className="p-1 hover:bg-red-50 rounded text-text-secondary hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="font-bold text-gray-800">
                                {editingCategory.id ? 'Edit Service' : 'Add New Service'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Service Name</label>
                                <input
                                    type="text"
                                    required
                                    value={editingCategory.name || ''}
                                    onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Type</label>
                                <select
                                    value={editingCategory.type || 'local'}
                                    onChange={e => setEditingCategory({ ...editingCategory, type: e.target.value as 'local' | 'online' })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                >
                                    <option value="local">Local (Physical)</option>
                                    <option value="online">Online (Remote)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                                <textarea
                                    value={editingCategory.description || ''}
                                    onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[100px]"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn-primary"
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
