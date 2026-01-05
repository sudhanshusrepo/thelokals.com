'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../../../components/layout/AdminLayout';
import { useParams, useRouter } from 'next/navigation';
import { adminService } from '@thelocals/core/services/adminService';
import { ServiceItem } from '@thelocals/core/types';
import { Plus, Edit2, Trash2, ArrowLeft, X } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { toast } from 'react-hot-toast';

export default function ServiceItemsPage() {
    const params = useParams();
    const router = useRouter();
    const categoryId = params.categoryId as string;

    const [items, setItems] = useState<ServiceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<ServiceItem>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (categoryId) loadItems();
    }, [categoryId]);

    const loadItems = async () => {
        setLoading(true);
        try {
            const data = await adminService.getServiceItems(categoryId);
            setItems(data);
        } catch (error) {
            toast.error("Failed to load service items");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await adminService.upsertServiceItem({
                ...editingItem,
                category_id: categoryId,
                commission_value: Number(editingItem.commission_value),
                base_price: Number(editingItem.base_price)
            });
            toast.success("Service item saved successfully");
            setIsModalOpen(false);
            loadItems();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This cannot be undone.")) return;
        try {
            await adminService.deleteServiceItem(id);
            toast.success("Service item deleted");
            loadItems();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const openModal = (item: Partial<ServiceItem> = {
        is_active: true,
        price_unit: 'fixed',
        commission_type: 'percent',
        commission_value: 10,
        base_price: 0
    }) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    return (
        <AdminLayout>
            <div className="mb-8">
                <button
                    onClick={() => router.push('/listings')}
                    className="flex items-center text-neutral-500 hover:text-neutral-900 mb-4 transition-colors text-sm font-medium"
                >
                    <ArrowLeft size={16} className="mr-1" /> Back to Categories
                </button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">Manage Service Items</h1>
                        <p className="text-sm text-neutral-500">Configure pricing and details for services in this category.</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors font-medium shadow-sm"
                    >
                        <Plus size={18} />
                        <span>Add Item</span>
                    </button>
                </div>
            </div>

            <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-100">
                            <tr>
                                <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Name</th>
                                <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Pricing</th>
                                <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Commission</th>
                                <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                                <th className="text-right py-3 px-6 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-neutral-500">Loading items...</td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-neutral-500">No items found. Add one to get started.</td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div>
                                                <span className="font-medium text-neutral-900 block">{item.name}</span>
                                                {item.description && (
                                                    <span className="text-xs text-neutral-400 max-w-xs block truncate">{item.description}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-neutral-900">₹{item.base_price}</span>
                                                <span className="text-xs text-neutral-500 capitalize">per {item.price_unit}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-neutral-100 text-neutral-600">
                                                {item.commission_value}{item.commission_type === 'percent' ? '%' : ' INR'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge variant={item.is_active ? 'success' : 'neutral'}>
                                                {item.is_active ? 'Active' : 'Draft'}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openModal(item)}
                                                    className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-primary transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-1.5 hover:bg-red-50 rounded-lg text-neutral-400 hover:text-red-600 transition-colors"
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
            </Card>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
                            <h3 className="font-bold text-neutral-900">
                                {editingItem.id ? 'Edit Service Item' : 'Add New Item'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-500 mb-1">Item Name</label>
                                <input
                                    type="text"
                                    required
                                    value={editingItem.name || ''}
                                    onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                                    className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    placeholder="e.g., Tap Repair"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-500 mb-1">Base Price (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={editingItem.base_price || ''}
                                        onChange={e => setEditingItem({ ...editingItem, base_price: Number(e.target.value) })}
                                        className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-500 mb-1">Unit</label>
                                    <select
                                        value={editingItem.price_unit || 'fixed'}
                                        onChange={e => setEditingItem({ ...editingItem, price_unit: e.target.value as any })}
                                        className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    >
                                        <option value="fixed">Fixed Price</option>
                                        <option value="hourly">Hourly</option>
                                        <option value="visit">Per Visit</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-100 space-y-4">
                                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Platform Commission</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-500 mb-1">Type</label>
                                        <select
                                            value={editingItem.commission_type || 'percent'}
                                            onChange={e => setEditingItem({ ...editingItem, commission_type: e.target.value as any })}
                                            className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        >
                                            <option value="percent">Percentage (%)</option>
                                            <option value="fixed">Fixed Amount (₹)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-500 mb-1">Value</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={editingItem.commission_value || ''}
                                            onChange={e => setEditingItem({ ...editingItem, commission_value: Number(e.target.value) })}
                                            className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editingItem.is_active ?? true}
                                        onChange={e => setEditingItem({ ...editingItem, is_active: e.target.checked })}
                                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <span className="text-sm font-medium text-neutral-700">Active (Visible to users)</span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 mt-4">
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
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 font-medium"
                                >
                                    {saving ? 'Saving...' : 'Save Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
