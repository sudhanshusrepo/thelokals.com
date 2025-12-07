
import React from 'react';
import { BookingStatus } from '@thelocals/core/types';

interface BookingStatusTimelineProps {
    status: BookingStatus;
}

const STEPS = [
    { status: 'REQUESTED', label: 'Requested', icon: '📝' },
    { status: 'PENDING', label: 'Finding Provider', icon: '🔍' },
    { status: 'CONFIRMED', label: 'Provider Found', icon: '✅' },
    { status: 'EN_ROUTE', label: 'On The Way', icon: '🚚' },
    { status: 'IN_PROGRESS', label: 'Work Started', icon: '🔧' },
    { status: 'COMPLETED', label: 'Completed', icon: '🎉' }
];

export const BookingStatusTimeline: React.FC<BookingStatusTimelineProps> = ({ status }) => {
    // Determine current step index
    // Handle edge cases like CANCELLED
    const getStepIndex = (s: BookingStatus) => {
        if (s === 'CANCELLED' || s === 'EXPIRED') return -1;
        return STEPS.findIndex(step => step.status === s);
    };

    const currentIndex = getStepIndex(status);

    if (status === 'CANCELLED') {
        return (
            <div className="bg-red-50 p-4 rounded-xl text-center border border-red-200">
                <div className="text-3xl mb-2">❌</div>
                <h3 className="text-red-700 font-bold">Booking Cancelled</h3>
            </div>
        );
    }

    // Fallback if status doesn't match steps (e.g. unknown)
    if (currentIndex === -1 && status !== 'CANCELLED') {
        // Mapping variations if needed, or simple fallback
        // Example: Treat ACCEPTED as CONFIRMED if aliased
        return null;
    }

    return (
        <div className="w-full py-6">
            <div className="relative flex justify-between items-center w-full">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>

                {/* Active Line Progress */}
                <div
                    className="absolute top-1/2 left-0 h-1 bg-teal-500 -z-10 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
                ></div>

                {STEPS.map((step, idx) => {
                    const isCompleted = idx <= currentIndex;
                    const isActive = idx === currentIndex;

                    return (
                        <div key={step.status} className="flex flex-col items-center group relative">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-10 
                                    ${isCompleted ? 'bg-teal-500 border-teal-500 text-white scale-110' : 'bg-white border-slate-200 text-slate-400'}
                                    ${isActive ? 'ring-4 ring-teal-100' : ''}
                                `}
                            >
                                <span className="text-sm">{isCompleted ? step.icon : idx + 1}</span>
                            </div>
                            <span
                                className={`absolute top-12 text-xs font-bold whitespace-nowrap transition-colors duration-300
                                    ${isCompleted ? 'text-teal-700' : 'text-slate-400'}
                                `}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
