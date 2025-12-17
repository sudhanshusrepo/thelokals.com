import React, { useState, useEffect } from 'react';
import { ServiceType } from '@core/types';

interface IncomingRequestModalProps {
    service: ServiceType;
    distance: string;
    earnings: number;
    checklist?: string[];
    estimatedCost?: number;
    onAccept: () => void;
    onReject: () => void;
}

export const IncomingRequestModal: React.FC<IncomingRequestModalProps> = ({ service, distance, earnings, checklist, estimatedCost, onAccept, onReject }) => {
    const [timeLeft, setTimeLeft] = useState(30);

    useEffect(() => {
        if (timeLeft === 0) {
            onReject();
            return;
        }
        const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, onReject]);

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-slide-up">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">New Job Request!</h2>
                    <div className="w-10 h-10 rounded-full border-4 border-teal-500 flex items-center justify-center font-bold text-teal-600">
                        {timeLeft}
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{service.name}</h3>
                    <p className="text-slate-500 mb-4">{service.description}</p>

                    <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                        <div className="flex items-center gap-2">
                            <span>📍 {distance} away</span>
                        </div>
                        <div className="flex items-center gap-2 text-teal-600 font-bold text-lg">
                            <span>💰 ₹{estimatedCost || earnings}</span>
                        </div>
                    </div>

                    {checklist && checklist.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Task Checklist</p>
                            <ul className="space-y-1">
                                {checklist.map((item, idx) => (
                                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                        <span className="text-teal-500 mt-1">✓</span> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={onReject}
                        className="py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                        Reject
                    </button>
                    <button
                        onClick={onAccept}
                        className="py-4 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-200 transition-all transform active:scale-95"
                    >
                        Accept Job
                    </button>
                </div>
            </div>
        </div>
    );
};
