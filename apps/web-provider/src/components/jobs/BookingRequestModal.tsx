'use client';

import React, { useEffect, useState } from 'react';
import { X, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent } from '../ui/dialog'; // Assuming we have or create a Dialog equivalent, or use simple fixed div for now
import { LiveBooking, liveBookingService } from '@thelocals/platform-core';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface BookingRequestModalProps {
    request: any; // DbBookingRequest joined with Booking
    onClose: () => void;
    onAccepted: () => void;
}

export function BookingRequestModal({ request, onClose, onAccepted }: BookingRequestModalProps) {
    const [timeLeft, setTimeLeft] = useState(45);
    const [accepting, setAccepting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onClose();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [onClose]);

    const handleAccept = async () => {
        setAccepting(true);
        try {
            await liveBookingService.acceptBooking(request.id, request.provider_id);
            toast.success("Job Accepted! Redirecting...");
            onAccepted();
            router.push(`/jobs/${request.booking_id}`);
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to accept job. It may have been taken.");
            onClose();
        } finally {
            setAccepting(false);
        }
    };

    if (!request) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom duration-300">
                {/* Header */}
                <div className="bg-primary p-4 text-white flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Clock size={20} className="animate-pulse" />
                        </div>
                        <div>
                            <p className="text-xs font-bold opacity-80 uppercase tracking-wide">New Request</p>
                            <p className="font-bold">Expires in {timeLeft}s</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {request.bookings?.service_categories?.name || 'New Service Request'}
                        </h2>
                        <p className="text-gray-500">
                            {request.bookings?.requirements?.date || 'Immediate'}
                        </p>
                    </div>

                    <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
                        <MapPin className="text-red-500 mt-1" size={20} />
                        <div>
                            <p className="font-bold text-gray-900">Customer Location</p>
                            <p className="text-sm text-gray-500 line-clamp-2">
                                {request.bookings?.address?.formatted || "Mumbai, Maharashtra"}
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-between items-center py-4 border-t border-gray-100">
                        <div>
                            <p className="text-sm text-gray-500">Est. Earnings</p>
                            <p className="text-2xl font-bold text-green-600">
                                ₹{request.bookings?.final_cost ? (request.bookings.final_cost * 0.85).toFixed(0) : '450'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            Decline
                        </button>
                        <button
                            onClick={handleAccept}
                            disabled={accepting}
                            className="w-full py-3 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
                        >
                            {accepting ? 'Accepting...' : 'Accept Job'}
                            {!accepting && <ArrowRight size={18} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
