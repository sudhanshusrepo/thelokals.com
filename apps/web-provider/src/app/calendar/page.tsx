
'use client';

import { useAuth } from '../../contexts/AuthContext';
import { ProviderLayout } from '../../components/layout/ProviderLayout';
import { useState } from 'react';
import { providerService } from "@thelocals/platform-core";
import { toast } from 'react-hot-toast';
import { Calendar as CalendarIcon, Clock, Power, Info, MapPin, Sliders } from 'lucide-react';
import { ServiceAreaEditor } from '../../components/maps/ServiceAreaEditor';

export default function CalendarPage() {
    const { user, profile, refreshProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [radius, setRadius] = useState(10);
    const [services, setServices] = useState([
        { id: 'cleaning', label: 'Home Cleaning', active: true },
        { id: 'repairs', label: 'General Repairs', active: true },
        { id: 'painting', label: 'Painting', active: false },
    ]);

    // Derived from profile.status (AVAILABLE / OFFLINE)
    const isOnline = profile?.status === 'AVAILABLE' || profile?.status === 'BUSY';

    const handleToggleOnline = async () => {
        if (!user?.id) return;

        // Optimistic UI
        const newStatus = isOnline ? 'OFFLINE' : 'AVAILABLE';

        setLoading(true);
        try {
            await providerService.updateAvailability(user.id, newStatus);
            await refreshProfile();
            toast.success(newStatus === 'AVAILABLE' ? "You are now ONLINE" : "You are now OFFLINE");
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProviderLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Availability & Calendar</h1>
                    <p className="text-neutral-500">Manage when you want to receive job requests.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Status Card */}
                <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Power size={20} className={isOnline ? "text-brand-green" : "text-neutral-400"} />
                        Current Status
                    </h3>

                    <div className={`p-4 rounded-xl border mb-6 transition-colors ${isOnline ? 'bg-green-50 border-green-200' : 'bg-neutral-50 border-neutral-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className={`font-bold text-lg ${isOnline ? 'text-green-700' : 'text-neutral-600'}`}>
                                {isOnline ? 'Online & Receiving Jobs' : 'Offline'}
                            </span>
                            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-neutral-400'}`} />
                        </div>
                        <p className="text-sm text-neutral-600">
                            {isOnline
                                ? "You are visible to customers nearby. Keep your app open to respond quickly."
                                : "You will not receive any new job requests while offline."}
                        </p>
                    </div>

                    <button
                        onClick={handleToggleOnline}
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg
                            ${isOnline
                                ? 'bg-white border-2 border-red-100 text-red-500 hover:bg-red-50'
                                : 'bg-brand-green text-black hover:opacity-90'
                            }`}
                    >
                        <Power size={20} />
                        {loading ? 'Updating...' : (isOnline ? 'Go Offline' : 'Go Online Now')}
                    </button>
                </div>

                {/* Service Area & Capabilities */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-neutral-100 p-6 mb-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <MapPin size={20} className="text-neutral-400" />
                        Service Area: {radius}km
                    </h3>

                    <div className="mb-6">
                        <ServiceAreaEditor
                            radiusKm={radius}
                            onRadiusChange={setRadius}
                            className="h-64 w-full mb-4"
                        />

                        <p className="text-sm text-neutral-500 text-center">
                            Drag the circle to adjust your service area.
                        </p>
                    </div>

                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 border-t border-neutral-100 pt-6">
                        <Sliders size={20} className="text-neutral-400" />
                        Active Services
                    </h3>

                    <div className="space-y-3">
                        {services.map(service => (
                            <div key={service.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                                <span className="font-medium text-neutral-700">{service.label}</span>
                                <button
                                    onClick={() => {
                                        setServices(services.map(s => s.id === service.id ? { ...s, active: !s.active } : s));
                                        toast.success("Service Updated");
                                    }}
                                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${service.active ? 'bg-brand-green' : 'bg-neutral-300'}`}
                                >
                                    <span className={`block w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${service.active ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Schedule Card (Mock) */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <CalendarIcon size={20} />
                            Weekly Schedule
                        </h3>
                        <span className="text-xs bg-brand-yellow/20 text-brand-text px-2 py-1 rounded font-bold">COMING SOON</span>
                    </div>

                    <div className="space-y-4 opacity-60 pointer-events-none">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                            <div key={day} className="flex items-center justify-between py-3 border-b border-neutral-50 last:border-0">
                                <span className="font-medium text-neutral-700 w-24">{day}</span>
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="flex items-center gap-2 bg-neutral-50 px-3 py-2 rounded-lg text-sm text-neutral-600 border border-neutral-100">
                                        <Clock size={14} /> 09:00 AM
                                    </div>
                                    <span className="text-neutral-300">-</span>
                                    <div className="flex items-center gap-2 bg-neutral-50 px-3 py-2 rounded-lg text-sm text-neutral-600 border border-neutral-100">
                                        <Clock size={14} /> 06:00 PM
                                    </div>
                                </div>
                                <div className="w-10 h-6 bg-brand-green rounded-full relative">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex items-start gap-3 bg-blue-50 p-4 rounded-xl text-blue-700 text-sm">
                        <Info size={20} className="flex-shrink-0 mt-0.5" />
                        <p>
                            Advanced scheduling is currently disabled. By default, you are available based on your "Online" status manually toggled on the left.
                        </p>
                    </div>
                </div>

            </div>
        </ProviderLayout>
    );
}
