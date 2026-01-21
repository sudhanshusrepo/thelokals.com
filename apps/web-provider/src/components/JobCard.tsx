
'use client';

import { MapPin, Clock, Calendar, Check, X } from 'lucide-react';
import { Booking } from "@thelocals/platform-core";

interface JobCardProps {
    job: Booking;
    isRequest?: boolean;
    onAccept?: () => void;
    onReject?: () => void;
    onClick?: () => void;
}

export const JobCard = ({ job, isRequest, onAccept, onReject, onClick }: JobCardProps) => {
    return (
        <div
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick?.();
                }
            }}
            className="bg-white rounded-card p-4 md:p-5 shadow-sm border border-neutral-100 hover:shadow-card transition-all duration-300 cursor-pointer group outline-none focus:ring-2 focus:ring-neutral-900"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-neutral-100 rounded-full flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: `url(${job.user?.avatarUrl || 'https://ui-avatars.com/api/?name=User'})` }} />
                    <div>
                        <h4 className="font-bold text-lg text-neutral-900 line-clamp-1">{job.service_category}</h4>
                        <p className="text-sm text-neutral-500">{job.user?.name || 'Customer'}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="bg-neutral-100 text-neutral-900 px-3 py-1 rounded-full text-xs font-bold mb-1">
                        ₹{job.estimated_cost || 0}
                    </span>
                    {isRequest && (
                        <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wide animate-pulse">
                            New Request
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-neutral-600 text-sm">
                    <MapPin size={16} className="text-neutral-400 group-hover:text-brand-green transition-colors" />
                    <span className="line-clamp-1">{job.address?.city || 'Location N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-600 text-sm">
                    <Clock size={16} className="text-neutral-400 group-hover:text-brand-green transition-colors" />
                    <span>{job.scheduled_date ? new Date(job.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Flexible'}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-600 text-sm">
                    <Calendar size={16} className="text-neutral-400 group-hover:text-brand-green transition-colors" />
                    <span>{job.scheduled_date ? new Date(job.scheduled_date).toLocaleDateString() : 'ASAP'}</span>
                </div>
            </div>

            {isRequest ? (
                <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={onReject}
                        className="flex-1 bg-red-50 text-red-600 font-bold py-3 rounded-button hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <X size={18} /> Reject
                    </button>
                    <button
                        onClick={onAccept}
                        className="flex-[2] bg-neutral-900 text-white font-bold py-3 rounded-button hover:bg-neutral-800 transition-colors shadow-lg shadow-neutral-900/20 flex items-center justify-center gap-2"
                    >
                        <Check size={18} /> Accept Job
                    </button>
                </div>
            ) : (
                <button className="w-full bg-neutral-50 text-neutral-900 font-bold py-3 rounded-button group-hover:bg-neutral-900 group-hover:text-white transition-all">
                    View Details
                </button>
            )}
        </div>
    );
};
