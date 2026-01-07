'use client';

import { Booking, DbBookingRequest } from "@thelocals/platform-core";
import { X, MapPin, Calendar, Clock, DollarSign, CheckCircle2, User, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface JobDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: Booking | null;
    isRequest?: boolean;
    onAccept?: (id: string) => void;
    onReject?: (id: string) => void;
    onStatusChange?: (id: string, status: any) => void;
}

export const JobDetailsModal = ({ isOpen, onClose, booking, isRequest, onAccept, onReject, onStatusChange }: JobDetailsModalProps) => {
    if (!booking) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.95 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]">
                            {/* Header */}
                            <div className="p-6 border-b border-neutral-100 flex items-start justify-between bg-neutral-50/50">
                                <div>
                                    <div className="text-sm font-semibold text-primary mb-1 uppercase tracking-wider">
                                        {isRequest ? 'New Request' : 'Job Details'}
                                    </div>
                                    <h2 className="text-2xl font-bold text-neutral-900">{booking.service_category}</h2>
                                    <div className="flex items-center gap-2 mt-1 text-neutral-500 text-sm">
                                        <span className="font-mono">#{booking.id.slice(0, 8)}</span>
                                        <span>•</span>
                                        <span>{new Date(booking.created_at).toLocaleString()}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="p-6 overflow-y-auto space-y-6">
                                {/* Location Section */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                                        <MapPin size={16} className="text-primary" /> Location
                                    </h3>
                                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100/50">
                                        <p className="text-neutral-900 font-medium">
                                            {(booking.address as any)?.formatted || 'Address details protected'}
                                        </p>
                                        {(booking.address as any)?.city && (
                                            <p className="text-neutral-500 text-sm mt-1">
                                                {(booking.address as any)?.city}, {(booking.address as any)?.state}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Customer Note / Requirements */}
                                {(booking.requirements || booking.notes) && (
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                                            <FileText size={16} className="text-primary" /> Task Details
                                        </h3>
                                        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100/50 text-sm text-neutral-600 space-y-2">
                                            {booking.notes && (
                                                <p><span className="font-medium text-neutral-900">Note:</span> {booking.notes}</p>
                                            )}
                                            {booking.requirements && (
                                                <div className="mt-2">
                                                    <span className="font-medium text-neutral-900 block mb-1">Requirements:</span>
                                                    <ul className="list-disc list-inside space-y-1">
                                                        {Object.entries(booking.requirements).map(([key, value]) => (
                                                            <li key={key}>{key}: {String(value)}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Financials */}
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 bg-green-50 p-4 rounded-xl border border-green-100">
                                        <div className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
                                            Est. Earnings
                                        </div>
                                        <div className="text-2xl font-bold text-green-800">
                                            ₹{booking.estimated_cost || 0}
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                        <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
                                            Payment Mode
                                        </div>
                                        <div className="text-lg font-bold text-blue-800">
                                            Cash / Online
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 flex gap-3">
                                {isRequest ? (
                                    <>
                                        <button
                                            onClick={() => onReject?.(booking.id)}
                                            className="flex-1 py-3 px-4 rounded-xl border border-neutral-200 text-neutral-700 font-semibold hover:bg-white hover:border-neutral-300 transition-all"
                                        >
                                            Ignore
                                        </button>
                                        <button
                                            onClick={() => onAccept?.(booking.id)}
                                            className="flex-[2] py-3 px-4 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle2 size={18} /> Accept Job
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {booking.status === 'CONFIRMED' && (
                                            <button
                                                onClick={() => onStatusChange?.(booking.id, 'IN_PROGRESS')}
                                                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                            >
                                                Start Job
                                            </button>
                                        )}
                                        {booking.status === 'IN_PROGRESS' && (
                                            <button
                                                onClick={() => onStatusChange?.(booking.id, 'COMPLETED')}
                                                className="flex-1 py-3 px-4 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle2 size={18} /> Complete Job
                                            </button>
                                        )}
                                        <button
                                            onClick={onClose}
                                            className={`py-3 px-4 rounded-xl font-semibold transition-all ${['CONFIRMED', 'IN_PROGRESS'].includes(booking.status)
                                                ? 'w-auto border border-neutral-200 text-neutral-700 bg-white hover:bg-neutral-50'
                                                : 'w-full bg-neutral-900 text-white hover:bg-neutral-800'
                                                }`}
                                        >
                                            Close
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
