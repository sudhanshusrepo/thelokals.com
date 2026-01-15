'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, ArrowRight, X } from 'lucide-react';
import { liveBookingService, PricingUtils } from '@thelocals/platform-core';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface IncomingRequestProps {
    request: any; // Ideally typed from DB
    onDismiss: () => void;
}

export function IncomingRequestCard({ request, onDismiss }: IncomingRequestProps) {
    const router = useRouter();
    const requirements = request.requirements || {};
    const price = requirements.price_locked || 0;

    const handleAccept = async () => {
        toast.loading("Accepting...");
        try {
            await liveBookingService.acceptBooking(request.booking_id, request.provider_id);
            toast.dismiss();
            toast.success("Job Accepted!");
            router.push(`/jobs/${request.booking_id}`);
            onDismiss();
        } catch (error) {
            console.error(error);
            toast.dismiss();
            toast.error("Failed to accept or job already taken.");
            onDismiss(); // Dismiss anyway if failed usually means taken
        }
    };

    const handleReject = async () => {
        try {
            await liveBookingService.rejectBooking(request.booking_id, request.provider_id);
            toast.success("Request declined");
            onDismiss();
        } catch (error) {
            console.error(error);
            onDismiss();
        }
    };

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-100"
        >
            <div className="bg-black text-white p-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-xs font-bold uppercase tracking-wider">New Request</span>
                </div>
                <div className="text-xs text-gray-300">
                    Expires in 30s
                </div>
            </div>

            <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                            {requirements.option?.name || 'Service Request'}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {requirements.option?.description || 'Standard Service'}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">{PricingUtils.formatPrice(price)}</p>
                        <p className="text-xs text-gray-400">Est. Earning</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl mb-6">
                    <MapPin size={18} className="text-gray-500 shrink-0" />
                    <p className="text-sm text-gray-700 font-medium truncate">
                        {requirements.location?.address || 'Location Hidden'}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleReject}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        <X size={18} />
                        Decline
                    </button>
                    <button
                        onClick={handleAccept}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-black hover:bg-gray-800 transition-colors shadow-lg"
                    >
                        Accept
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// Global Listener Component to inject into Layout
// Actually, we can just put the logic in the Layout wrapper we made, or make this a smart component.
// Let's make a smart component <IncomingRequestList /> 
