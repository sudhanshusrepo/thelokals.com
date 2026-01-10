'use client';

import { Booking, providerService } from "@thelocals/platform-core";
import { X, MapPin, Calendar, Clock, Phone, Navigation, CheckCircle, Play, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export const NavigateButton = ({ lat, lng }: { lat: number, lng: number }) => {
    const handleNavigate = () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
        window.open(url, '_blank');
    };

    return (
        <button
            onClick={handleNavigate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
        >
            <Navigation size={16} />
            <span>Navigate</span>
        </button>
    );
};

interface JobDetailSheetProps {
    isOpen: boolean;
    onClose: () => void;
    job: Booking | null;
    onUpdate: () => void;
}

export const JobDetailSheet = ({ isOpen, onClose, job, onUpdate }: JobDetailSheetProps) => {
    const [loading, setLoading] = useState(false);

    if (!isOpen || !job) return null;

    const handleStatusUpdate = async (newStatus: 'EN_ROUTE' | 'IN_PROGRESS' | 'COMPLETED') => {
        if (!confirm(`Are you sure you want to mark this job as ${newStatus}?`)) return;
        setLoading(true);
        try {
            await providerService.updateBookingStatus(job.id, newStatus);
            toast.success("Status updated!");
            onUpdate();
            onClose();
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-white z-10">
                    <h2 className="text-lg font-bold">Job Details</h2>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* User Info */}
                    <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
                        <div className="w-12 h-12 bg-neutral-200 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${job.user?.avatarUrl || 'https://ui-avatars.com/api/?name=Customer'})` }} />
                        <div>
                            <h3 className="font-bold text-lg">{job.user?.name || 'Customer'}</h3>
                            <p className="text-sm text-neutral-500">Verified Customer</p>
                        </div>
                        <div className="ml-auto flex gap-2">
                            <a href={`tel:${job.user?.phone || ''}`} className="p-2 bg-white border border-neutral-200 rounded-full text-brand-text hover:bg-neutral-100">
                                <Phone size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Service Details */}
                    <div>
                        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Service</h4>
                        <div className="p-4 border border-neutral-100 rounded-xl shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-lg">{job.service_category}</span>
                                <span className="font-bold text-brand-green">₹{job.estimated_cost}</span>
                            </div>
                            <p className="text-neutral-500 text-sm mb-4">Standard service request.</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2 text-sm text-neutral-600">
                                    <Calendar size={16} className="text-neutral-400" />
                                    {job.scheduled_date ? new Date(job.scheduled_date).toLocaleDateString() : 'ASAP'}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-neutral-600">
                                    <Clock size={16} className="text-neutral-400" />
                                    {job.scheduled_date ? new Date(job.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Flexible'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Location</h4>
                        <div className="p-4 border border-neutral-100 rounded-xl shadow-sm flex items-start gap-3">
                            <MapPin className="text-brand-red flex-shrink-0" size={20} />
                            <div>
                                <p className="font-medium text-neutral-900 mb-1">Service Address</p>
                                <p className="text-sm text-neutral-500 leading-relaxed">
                                    {/* Try to parse address safely */}
                                    {typeof job.address === 'string' ? job.address : (job.address as any)?.street || (job.address as any)?.formatted_address || 'Address provided on map'}
                                </p>

                                {/* Map Preview */}
                                <div className="mt-3 w-full h-32 bg-neutral-100 rounded-lg overflow-hidden relative">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        scrolling="no"
                                        marginHeight={0}
                                        marginWidth={0}
                                        src={`https://maps.google.com/maps?q=${encodeURIComponent(typeof job.address === 'string' ? job.address : (job.address as any)?.formatted_address || 'New Delhi')}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                                    />
                                    <div className="absolute inset-0 bg-transparent" /> {/* Interaction shield for scrol */}
                                </div>

                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(typeof job.address === 'string' ? job.address : (job.address as any)?.formatted_address || '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-3 flex items-center gap-2 text-sm font-bold text-brand-text hover:underline"
                                >
                                    <Navigation size={16} /> Get Directions
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-neutral-100 bg-white pb-safe">
                    {/* Status State Machine Logic */}
                    {job.status === 'CONFIRMED' && (
                        <button
                            disabled={loading}
                            onClick={() => handleStatusUpdate('EN_ROUTE')}
                            className="w-full bg-neutral-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-800 disabled:opacity-50"
                        >
                            <Navigation size={20} /> I'm on the way
                        </button>
                    )}

                    {job.status === 'EN_ROUTE' && (
                        <button
                            disabled={loading}
                            onClick={() => handleStatusUpdate('IN_PROGRESS')}
                            className="w-full bg-brand-green text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-opacity-90 disabled:opacity-50"
                        >
                            <Play size={20} /> Start Job
                        </button>
                    )}

                    {job.status === 'IN_PROGRESS' && (
                        <button
                            disabled={loading}
                            onClick={() => handleStatusUpdate('COMPLETED')}
                            className="w-full bg-neutral-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-800 disabled:opacity-50"
                        >
                            <CheckCircle size={20} /> Complete Job
                        </button>
                    )}

                    {job.status === 'COMPLETED' && (
                        <div className="w-full bg-green-50 text-green-700 font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                            <CheckCircle size={20} /> Job Completed
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
