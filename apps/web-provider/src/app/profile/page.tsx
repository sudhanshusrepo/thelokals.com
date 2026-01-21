
'use client';

import { useAuth } from '../../contexts/AuthContext';
import { ProviderLayout } from '../../components/layout/ProviderLayout';
import { useState, useEffect } from 'react';
import { providerService, WorkerCategory } from "@thelocals/platform-core";
import { toast } from 'react-hot-toast';
import { User, Briefcase, Settings, Camera, Save, Loader2, ShieldCheck, BadgeCheck, Wallet, FileText, Phone } from 'lucide-react';
import { FileUpload } from '../../components/ui/FileUpload';
import { ProfileSchema } from '../../utils/validation/profileSchema';
import { z } from 'zod';

export default function ProfilePage() {
    const { user, profile, refreshProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'services' | 'settings' | 'bank' | 'documents' | 'support'>('profile');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        phone: '',
        imageUrl: '',
        price: 0,
        category: '',
        documents: {
            aadhaar_front: '',
            aadhaar_back: '',
            pan_card: ''
        },
        bankDetails: {
            upi_id: '',
            account_number: '',
            ifsc_code: '',
            account_holder_name: ''
        }
    });


    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || user?.email || '', // Fallback to email if name missing
                description: profile.description || '',
                phone: (profile.phone || user?.phone) || '',
                imageUrl: profile.imageUrl || '',
                price: profile.price || 0,
                category: profile.category || '',
                documents: {
                    aadhaar_front: profile.documents?.aadhaar_front || '',
                    aadhaar_back: profile.documents?.aadhaar_back || '',
                    pan_card: profile.documents?.pan_card || ''
                },
                bankDetails: {
                    upi_id: profile.bank_details?.upi_id || '',
                    account_number: profile.bank_details?.account_number || '',
                    ifsc_code: profile.bank_details?.ifsc_code || '',
                    account_holder_name: profile.bank_details?.account_holder_name || ''
                }
            });
        }
    }, [profile, user]);

    const handleSave = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            // Validate Form Data
            const validationData = {
                name: formData.name,
                description: formData.description,
                price: Number(formData.price),
                imageUrl: formData.imageUrl,
                bankDetails: formData.bankDetails
            };

            ProfileSchema.parse(validationData);

            await providerService.updateProfile(user.id, {
                name: formData.name,
                description: formData.description,
                price: Number(formData.price),
                imageUrl: formData.imageUrl,
                documents: formData.documents,
                bank_details: formData.bankDetails
            });
            await refreshProfile();
            toast.success("Profile Updated!");
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                toast.error(error.errors[0].message);
            } else {
                toast.error("Failed to update profile");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProviderLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Profile & Settings</h1>
                    <p className="text-neutral-500">Manage your public profile and preferences.</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar / Tabs */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
                        {[
                            { id: 'profile', label: 'Public Profile', icon: User },
                            { id: 'services', label: 'Services & Rates', icon: Briefcase },
                            { id: 'bank', label: 'Bank Details', icon: Wallet },
                            { id: 'documents', label: 'Documents', icon: FileText },
                            { id: 'settings', label: 'App Settings', icon: Settings },
                            { id: 'support', label: 'Help & Support', icon: Phone }, // Added Support Tab
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-4
                                    ${activeTab === tab.id
                                        ? 'border-brand-yellow bg-neutral-50 text-neutral-900'
                                        : 'border-transparent text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">

                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-full bg-neutral-100 bg-cover bg-center border-2 border-white shadow-md"
                                            style={{ backgroundImage: `url(${formData.imageUrl || 'https://ui-avatars.com/api/?name=' + formData.name})` }}
                                        />
                                        <button className="absolute bottom-0 right-0 p-2 bg-neutral-900 text-white rounded-full hover:bg-neutral-800 transition-colors shadow-lg">
                                            <Camera size={14} />
                                        </button>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg">{formData.name || 'Your Name'}</h3>
                                            {(profile as any)?.isVerified || (profile as any)?.is_verified ? (
                                                <BadgeCheck size={20} className="text-blue-500" fill="currentColor" color="white" />
                                            ) : (
                                                <div className="bg-neutral-100 text-neutral-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                                                    Unverified
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-neutral-500 text-sm">{formData.category || 'Service Provider'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-neutral-700">Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full p-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-900 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-neutral-700">Phone Number</label>
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            disabled // Phone usually not editable directly
                                            className="w-full p-3 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-500 cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                        <label className="text-sm font-medium text-neutral-700">Bio / Description</label>
                                        <textarea
                                            rows={4}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full p-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-900 transition-colors"
                                            placeholder="Tell customers about your experience..."
                                        />
                                    </div>
                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                        <label className="text-sm font-medium text-neutral-700">Profile Image URL (Temporary)</label>
                                        <input
                                            type="text"
                                            value={formData.imageUrl}
                                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                            className="w-full p-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-900 transition-colors"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'services' && (
                            <div className="space-y-6">
                                <div className="p-4 bg-brand-bg rounded-lg border border-brand-green/20">
                                    <h3 className="font-bold text-brand-text mb-1">Primary Category</h3>
                                    <p className="text-sm text-neutral-600">You are registered as a <span className="font-bold">{formData.category}</span>.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-700">Base Price (Starting from)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">₹</span>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                            className="w-full p-3 pl-8 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-900 transition-colors"
                                        />
                                    </div>
                                    <p className="text-xs text-neutral-400">This price is shown to customers before booking.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'bank' && (
                            <div className="space-y-6">
                                <h3 className="font-bold text-neutral-900">Payout Details</h3>
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                                    Payments are processed every Friday. Ensure your UPI ID is correct.
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-neutral-700">UPI ID / VPA</label>
                                        <div className="relative">
                                            <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder="username@upi"
                                                value={formData.bankDetails.upi_id}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    bankDetails: { ...formData.bankDetails, upi_id: e.target.value }
                                                })}
                                                className="w-full p-3 pl-10 rounded-lg border border-neutral-200 focus:outline-none focus:border-brand-green transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-neutral-700">Account Holder Name</label>
                                        <input
                                            type="text"
                                            placeholder="As per bank records"
                                            value={formData.bankDetails.account_holder_name}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                bankDetails: { ...formData.bankDetails, account_holder_name: e.target.value }
                                            })}
                                            className="w-full p-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-brand-green transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-neutral-700">Account Number</label>
                                        <input
                                            type="text"
                                            placeholder="0000000000"
                                            value={formData.bankDetails.account_number}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                bankDetails: { ...formData.bankDetails, account_number: e.target.value }
                                            })}
                                            className="w-full p-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-brand-green transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-neutral-700">IFSC Code</label>
                                        <input
                                            type="text"
                                            placeholder="ABCD0123456"
                                            value={formData.bankDetails.ifsc_code}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                bankDetails: { ...formData.bankDetails, ifsc_code: e.target.value }
                                            })}
                                            className="w-full p-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-brand-green transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'documents' && (
                            <div className="space-y-6">
                                <h3 className="font-bold text-neutral-900">My Documents</h3>
                                <p className="text-sm text-neutral-500">Upload documents to increase your trust score.</p>

                                <div className="space-y-4">
                                    <div className="space-y-4">
                                        <FileUpload
                                            label="Aadhaar Card (Front)"
                                            path={`documents/${user?.id}/aadhaar_front`}
                                            currentUrl={formData.documents.aadhaar_front}
                                            onUploadComplete={(url) => setFormData({
                                                ...formData,
                                                documents: { ...formData.documents, aadhaar_front: url }
                                            })}
                                        />
                                        <FileUpload
                                            label="Aadhaar Card (Back)"
                                            path={`documents/${user?.id}/aadhaar_back`}
                                            currentUrl={formData.documents.aadhaar_back}
                                            onUploadComplete={(url) => setFormData({
                                                ...formData,
                                                documents: { ...formData.documents, aadhaar_back: url }
                                            })}
                                        />
                                        <FileUpload
                                            label="PAN Card"
                                            path={`documents/${user?.id}/pan_card`}
                                            currentUrl={formData.documents.pan_card}
                                            onUploadComplete={(url) => setFormData({
                                                ...formData,
                                                documents: { ...formData.documents, pan_card: url }
                                            })}
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-brand-bg rounded-lg flex items-start gap-3 mt-4">
                                    <ShieldCheck className="text-brand-green mt-0.5 flex-shrink-0" size={18} />
                                    <p className="text-sm text-neutral-700">
                                        Your documents are encrypted and stored securely. They are only shared with authorities if required by law.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-6">
                                <h3 className="font-bold text-neutral-900">App Preferences</h3>

                                {/* Availability Toggle */}
                                <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                            <p className="font-bold text-neutral-900">Accepting New Jobs</p>
                                        </div>
                                        <div className="w-12 h-6 bg-brand-green rounded-full relative cursor-pointer px-1 flex items-center justify-end">
                                            <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                        </div>
                                    </div>
                                    <p className="text-sm text-neutral-500">
                                        You are visible to customers. Turn this off to take a break.
                                    </p>
                                </div>

                                <h3 className="font-bold text-neutral-900 pt-4">Notifications</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-neutral-900">New Job Alerts</p>
                                            <p className="text-xs text-neutral-500">Get notified when a new request matches your skills.</p>
                                        </div>
                                        <div className="w-11 h-6 bg-brand-green rounded-full relative cursor-pointer">
                                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-neutral-900">SMS Notifications</p>
                                            <p className="text-xs text-neutral-500">Receive crucial updates via SMS.</p>
                                        </div>
                                        <div className="w-11 h-6 bg-neutral-200 rounded-full relative cursor-pointer">
                                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'support' && (
                            <div className="space-y-6">
                                <h3 className="font-bold text-neutral-900">Help & Support</h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-white border border-neutral-200 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                                <Phone size={20} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-neutral-900">Call Support</p>
                                                <p className="text-sm text-neutral-500">Available 9 AM - 6 PM</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-neutral-900 text-white text-sm font-bold rounded-lg">Call Now</button>
                                    </div>
                                    <div className="p-4 bg-white border border-neutral-200 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-neutral-900">FAQs & Guides</p>
                                                <p className="text-sm text-neutral-500">Read our help articles</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 border border-neutral-200 text-neutral-900 text-sm font-bold rounded-lg">View Docs</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 pt-6 border-t border-neutral-100 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="bg-neutral-900 text-white font-bold py-3 px-6 rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading && <Loader2 size={18} className="animate-spin" />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ProviderLayout>
    );
}
