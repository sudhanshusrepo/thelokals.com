import Link from 'next/link';
import { Settings as SettingsIcon, Shield, Bell, Key, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import RoleGuard from '../components/RoleGuard';

export default function Settings() {
    const [activeTab, setActiveTab] = useState('general');

    const handleSave = () => {
        toast.success("Settings saved successfully (Simulation)");
    };

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
                            <h1 className="text-2xl font-bold text-white">System Settings</h1>
                        </div>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-purple-900/20"
                        >
                            <Save size={18} />
                            Save Changes
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">

                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 space-y-2">
                    {[
                        { id: 'general', label: 'General', icon: SettingsIcon },
                        { id: 'security', label: 'Security & Access', icon: Shield },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'api', label: 'API Keys', icon: Key },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id
                                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}
                </aside>

                {/* Content Area */}
                <div className="flex-1 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-8 min-h-[500px]">
                    {activeTab === 'general' && (
                        <div className="space-y-6 max-w-2xl">
                            <h2 className="text-xl font-bold text-white mb-6">General Configuration</h2>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Platform Name</label>
                                <input type="text" defaultValue="The Lokals" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Support Email</label>
                                <input type="email" defaultValue="admin@thelokals.com" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none" />
                            </div>
                            <div className="flex items-center gap-3 pt-4">
                                <input type="checkbox" id="maint" className="w-4 h-4 rounded bg-slate-900 border-slate-600 text-purple-600 focus:ring-purple-500" />
                                <label htmlFor="maint" className="text-slate-300">Enable Maintenance Mode</label>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <RoleGuard allowedRoles={['super_admin']} fallback={
                            <div className="p-8 text-center bg-red-500/10 rounded-xl text-red-400 border border-red-500/20">
                                <Shield className="mx-auto mb-2" size={32} />
                                <h3 className="font-bold">Access Denied</h3>
                                <p className="text-sm opacity-80">You do not have permission to view security settings.</p>
                            </div>
                        }>
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-white mb-6">Security Settings</h2>
                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-200 text-sm mb-6">
                                    These settings control platform-wide security policies. Changing them may affect user login sessions.
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-700">
                                        <div>
                                            <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                                            <p className="text-slate-400 text-xs">Require 2FA for all admin accounts</p>
                                        </div>
                                        <div className="w-12 h-6 bg-purple-600 rounded-full relative cursor-pointer">
                                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </RoleGuard>
                    )}

                    {['notifications', 'api'].includes(activeTab) && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500">
                            <SettingsIcon size={48} className="mb-4 opacity-50" />
                            <p>This configuration module is coming soon.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
