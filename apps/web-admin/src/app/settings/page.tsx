'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { adminService, SystemConfig, MarketingBanner } from "@thelocals/platform-core";
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { toast } from 'react-hot-toast';
import {
    Settings,
    Megaphone,
    ToggleLeft,
    ToggleRight,
    Plus,
    Trash2,
    Edit2,
    Image as ImageIcon
} from 'lucide-react';

import { RoleGuard } from '../../components/auth/RoleGuard';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'CONFIG' | 'BANNERS'>('CONFIG');

    return (
        <AdminLayout>
            <RoleGuard
                allowedRoles={['SUPER_ADMIN', 'OPS_ADMIN']}
                fallback={<div className="p-8 text-center text-red-500">You do not have permission to access Settings.</div>}
            >
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-neutral-900">Settings & Configuration</h1>
                    <p className="text-sm text-neutral-500">Manage system feature flags and marketing content.</p>
                </div>

                <div className="flex border-b border-neutral-200 mb-6">
                    <button
                        onClick={() => setActiveTab('CONFIG')}
                        className={`px-6 py-3 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'CONFIG' ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}
                    >
                        <Settings size={18} />
                        System Configs
                    </button>
                    <button
                        onClick={() => setActiveTab('BANNERS')}
                        className={`px-6 py-3 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'BANNERS' ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}
                    >
                        <Megaphone size={18} />
                        Marketing Banners
                    </button>
                </div>

                {activeTab === 'CONFIG' ? <ConfigTab /> : <BannersTab />}
            </RoleGuard>
        </AdminLayout>
    );
}

import { useAuth } from '../../contexts/AuthContext';
import { useConfigs, useBanners } from '../../hooks/useAdminData';

function ConfigTab() {
    const { adminUser } = useAuth();
    const { configs, isLoading: loading, mutate } = useConfigs();

    // Removed manual loadConfigs/useEffect

    const toggleConfig = async (config: SystemConfig) => {
        if (!adminUser) return;
        try {
            // Assume boolean value for now
            const newValue = !config.value;
            await adminService.updateSystemConfig(config.key, newValue, adminUser.id);

            // Optimistic update
            mutate(configs.map((c: SystemConfig) =>
                c.key === config.key ? { ...c, value: newValue } : c
            ), false);

            toast.success(`Updated ${config.key}`);
            mutate(); // Revalidate
        } catch (error) {
            toast.error('Failed to update config');
        }
    };

    if (loading) return <div className="p-8 text-center text-neutral-500">Loading settings...</div>;

    return (
        <div className="grid gap-6">
            <Card className="p-0 overflow-hidden">
                <div className="p-4 bg-neutral-50 border-b border-neutral-100 font-medium text-neutral-700">
                    Feature Flags & System Toggles
                </div>
                <div className="divide-y divide-neutral-100">
                    {configs.length === 0 && <div className="p-8 text-center text-neutral-400">No configs found.</div>}
                    {configs.map((config: SystemConfig) => (
                        <div key={config.key} className="p-6 flex items-center justify-between hover:bg-neutral-50/50">
                            <div>
                                <h3 className="font-mono text-sm font-bold text-neutral-900 mb-1">{config.key}</h3>
                                <p className="text-sm text-neutral-500">{config.description || 'No description'}</p>
                                <div className="mt-2 flex gap-2">
                                    <Badge variant="neutral" className="text-xs">{config.category}</Badge>
                                    {config.is_public && <Badge variant="info" className="text-xs">Public</Badge>}
                                </div>
                            </div>
                            <button
                                onClick={() => toggleConfig(config)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${config.value ? 'bg-green-600' : 'bg-neutral-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.value ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

function BannersTab() {
    const { adminUser } = useAuth();
    const { banners, isLoading: loading, mutate } = useBanners();
    const [iscreateModalOpen, setIsCreateModalOpen] = useState(false);

    // New Banner Form State
    const [newBanner, setNewBanner] = useState<{ title: string; image_url: string; link_url: string; position: number }>({
        title: '',
        image_url: '',
        link_url: '',
        position: 0
    });

    // Removed manual loadBanners/useEffect

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this banner?') || !adminUser) return;
        try {
            await adminService.deleteMarketingBanner(id, adminUser.id);
            mutate(banners.filter((b: MarketingBanner) => b.id !== id), false);
            toast.success('Banner deleted');
            mutate();
        } catch (error) {
            toast.error('Failed to delete banner');
        }
    };

    const handleCreate = async () => {
        if (!adminUser) return;
        try {
            if (!newBanner.title || !newBanner.image_url) {
                toast.error('Title and Image URL are required');
                return;
            }

            await adminService.createMarketingBanner({
                ...newBanner,
                is_active: true
            }, adminUser.id);

            toast.success('Banner created');
            setIsCreateModalOpen(false);
            setNewBanner({ title: '', image_url: '', link_url: '', position: 0 });
            mutate();
        } catch (error) {
            toast.error('Failed to create banner');
        }
    };

    const toggleBannerStatus = async (banner: MarketingBanner) => {
        if (!adminUser) return;
        try {
            await adminService.updateMarketingBanner(banner.id, { is_active: !banner.is_active }, adminUser.id);
            mutate(banners.map((b: MarketingBanner) => b.id === banner.id ? { ...b, is_active: !b.is_active } : b), false);
            toast.success('Banner status updated');
            mutate();
        } catch (error) {
            toast.error('Failed to update banner');
        }
    };

    if (loading) return <div className="p-8 text-center text-neutral-500">Loading banners...</div>;

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg hover:bg-neutral-800"
                >
                    <Plus size={18} />
                    Add Banner
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {banners.map((banner: MarketingBanner) => (
                    <Card key={banner.id} className="overflow-hidden p-0 group">
                        <div className="h-40 bg-neutral-100 relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleDelete(banner.id)} className="p-2 bg-white/90 text-red-600 rounded-lg hover:bg-white shadow-sm">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            {!banner.is_active && (
                                <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[2px]">
                                    <Badge variant="neutral">Inactive</Badge>
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-neutral-900">{banner.title}</h3>
                                    {banner.link_url && <p className="text-xs text-blue-600 truncate max-w-[200px]">{banner.link_url}</p>}
                                </div>
                                <button onClick={() => toggleBannerStatus(banner)}>
                                    {banner.is_active ? <ToggleRight size={24} className="text-green-600" /> : <ToggleLeft size={24} className="text-neutral-400" />}
                                </button>
                            </div>
                            <div className="mt-2 text-xs text-neutral-500 flex gap-4">
                                <span>Pos: {banner.position}</span>
                                <span>CTA: {banner.cta_text || 'None'}</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Create Modal */}
            {iscreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-neutral-900 mb-4">Add Marketing Banner</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-1">Title</label>
                                <input
                                    className="w-full p-2 border border-neutral-300 rounded"
                                    value={newBanner.title}
                                    onChange={e => setNewBanner({ ...newBanner, title: e.target.value })}
                                    placeholder="Promotional Banner Title"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-1">Image URL</label>
                                <div className="flex gap-2">
                                    <input
                                        className="w-full p-2 border border-neutral-300 rounded"
                                        value={newBanner.image_url}
                                        onChange={e => setNewBanner({ ...newBanner, image_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                    <button className="p-2 bg-neutral-100 rounded text-neutral-600"><ImageIcon size={18} /></button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-1">Link URL (Optional)</label>
                                <input
                                    className="w-full p-2 border border-neutral-300 rounded"
                                    value={newBanner.link_url}
                                    onChange={e => setNewBanner({ ...newBanner, link_url: e.target.value })}
                                    placeholder="/services/cleaning"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-1">Position (Order)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border border-neutral-300 rounded"
                                    value={newBanner.position}
                                    onChange={e => setNewBanner({ ...newBanner, position: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-2 text-neutral-600 hover:bg-neutral-50 rounded-lg font-medium">Cancel</button>
                            <button onClick={handleCreate} className="flex-1 py-2 bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg font-medium">Create Banner</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
