'use client';

import { Booking } from "@thelocals/platform-core";
import { Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

interface JobCardProps {
    booking: Booking;
    isRequest?: boolean;
    onAccept?: (id: string) => void;
    onClick?: () => void;
}

export const JobCard = ({ booking, isRequest, onAccept, onClick }: JobCardProps) => {
    return (
        <div
            onClick={onClick}
            className="group bg-white rounded-xl p-6 shadow-sm border border-neutral-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-all cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-300 relative overflow-hidden"
        >
            {/* Status Indicator Bar */}
            <div className={clsx(
                "absolute left-0 top-0 bottom-0 w-1",
                booking.status === 'COMPLETED' ? 'bg-green-500' :
                    booking.status === 'CANCELLED' ? 'bg-red-500' :
                        isRequest ? 'bg-yellow-500' : 'bg-primary'
            )} />

            <div className="flex-1 pl-2">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-neutral-900 group-hover:text-primary transition-colors">
                        {booking.service_category || 'Service Request'}
                    </h3>
                    <span className={clsx(
                        "px-2 py-1 rounded-md text-xs font-bold uppercase",
                        booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                isRequest ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                    )}>
                        {isRequest ? 'NEW REQUEST' : booking.status}
                    </span>
                </div>

                <div className="space-y-2 text-sm text-neutral-600">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-neutral-400" />
                        <span>{new Date(booking.created_at).toLocaleDateString(undefined, {
                            weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'
                        })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-neutral-400" />
                        <span className="line-clamp-1">{(booking.address as any)?.formatted || 'Location details protected'}</span>
                    </div>
                    {booking.estimated_cost && (
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-neutral-900">₹{booking.estimated_cost}</span>
                            <span className="text-xs text-neutral-400">(Est.)</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col justify-center gap-2 min-w-[150px] pl-2 border-t md:border-t-0 md:border-l border-neutral-100 pt-4 md:pt-0 md:pl-6">
                {isRequest ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAccept?.(booking.id);
                        }}
                        className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-hover font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                    >
                        <CheckCircle2 size={16} /> Accept
                    </button>
                ) : (
                    <div className="text-center text-sm text-neutral-400 italic">
                        Click to view details
                    </div>
                )}
            </div>
        </div>
    );
};
