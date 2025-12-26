import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus } from '@thelocals/core';
import { bookingService } from '../services/bookingService';
import { toast } from 'react-hot-toast';
import { ArrowLeft, MapPin, Navigation, Clock } from 'lucide-react';

interface ActiveJobWorkbenchProps {
    booking: Booking;
    onUpdateStatus: (bookingId: string, status: BookingStatus) => void;
    onClose: () => void;
}

export const ActiveJobWorkbench: React.FC<ActiveJobWorkbenchProps> = ({ booking, onUpdateStatus, onClose }) => {
    const [notes, setNotes] = useState(booking.notes || '');
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');

    // Simple timer if job is IN_PROGRESS
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (booking.status === 'IN_PROGRESS' && booking.started_at) {
            const startTime = new Date(booking.started_at).getTime();
            interval = setInterval(() => {
                const now = new Date().getTime();
                const diff = now - startTime;
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setElapsedTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [booking.status, booking.started_at]);

    const handleSaveNotes = async () => {
        try {
            setIsSavingNotes(true);
            await bookingService.updateBookingNotes(booking.id, notes);
            toast.success('Notes saved');
        } catch (error) {
            console.error('Failed to save notes', error);
            toast.error('Failed to save notes');
        } finally {
            setIsSavingNotes(false);
        }
    };

    const handleNavigate = () => {
        const query = encodeURIComponent(`Client Location`);
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    };

    const status = booking.status?.toUpperCase();

    return (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto animate-fade-in flex flex-col font-sans">
            {/* Header */}
            <header className="bg-primary text-white p-4 shadow-md sticky top-0 z-10 backdrop-blur-md bg-opacity-95">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <button onClick={onClose} className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="font-bold text-lg font-display tracking-wide">Active Job</div>
                    <div className="w-10"></div>
                </div>
            </header>

            <main className="flex-1 max-w-3xl mx-auto w-full p-4 space-y-6 pb-24">

                {/* Status Hero Card */}
                <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden relative">
                    <div className={`absolute top-0 left-0 right-0 h-2 
                        ${status === 'IN_PROGRESS' ? 'bg-blue-500' :
                            status === 'EN_ROUTE' ? 'bg-amber-500' : 'bg-green-500'}`}
                    />
                    <div className="p-6 pt-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 font-display mb-1">{booking.user?.name || 'Client'}</h2>
                                <p className="text-slate-500 text-sm font-medium tracking-wide">#{booking.id.slice(0, 8)}</p>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border ${status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                status === 'EN_ROUTE' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    'bg-green-50 text-green-600 border-green-100'
                                }`}>
                                {status?.replace('_', ' ')}
                            </div>
                        </div>

                        {status === 'IN_PROGRESS' && (
                            <div className="mb-8 flex justify-center">
                                <div className="flex items-center gap-3 bg-slate-50 px-8 py-4 rounded-2xl border border-slate-100 shadow-inner">
                                    <Clock className="w-6 h-6 text-slate-400" />
                                    <div className="text-5xl font-mono font-bold text-slate-700 tracking-tighter">
                                        {elapsedTime}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Address / Location Placeholder */}
                        <div className="bg-slate-50 p-5 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-slate-100 transition-colors" onClick={handleNavigate}>
                            <div className="flex items-center gap-4">
                                <div className="bg-white p-3 rounded-full shadow-sm text-primary">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 text-base">Service Location</p>
                                    <p className="text-sm text-slate-500 font-medium">View details in map</p>
                                </div>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm group-hover:scale-105 transition-transform">
                                <Navigation className="w-5 h-5 text-primary" />
                            </div>
                        </div>

                        {/* Requirements / Notes from Client */}
                        {(booking as any).requirements && (
                            <div className="mt-6 border-t border-slate-100 pt-6">
                                <h4 className="font-bold text-sm text-slate-900 mb-2 uppercase tracking-wide opacity-50">Requirements</h4>
                                <div className="bg-slate-50 p-4 rounded-2xl text-sm text-slate-700 leading-relaxed">
                                    {JSON.stringify((booking as any).requirements, null, 2)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Notes Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                    <h3 className="font-bold text-slate-900 mb-4 font-display text-lg">Job Notes</h3>
                    <textarea
                        className="w-full border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[120px] font-sans text-slate-700 text-base resize-none bg-slate-50 focus:bg-white"
                        placeholder="Add private notes about this job..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={handleSaveNotes}
                            disabled={isSavingNotes}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md hover:shadow-lg active:scale-95 ${isSavingNotes ? 'bg-slate-400 cursor-not-allowed' : 'bg-primary hover:opacity-90'
                                }`}
                        >
                            {isSavingNotes ? 'Saving...' : 'Save Notes'}
                        </button>
                    </div>
                </div>

                {/* Main Action Button */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-20 pb-8 sm:pb-4">
                    <div className="max-w-3xl mx-auto">
                        {status === 'CONFIRMED' && (
                            <button
                                onClick={() => onUpdateStatus(booking.id, 'EN_ROUTE')}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg py-4 rounded-2xl hover:shadow-blue-500/30 hover:shadow-xl transition-all active:scale-[0.98]"
                            >
                                I'm On My Way 🚗
                            </button>
                        )}
                        {status === 'EN_ROUTE' && (
                            <button
                                onClick={() => onUpdateStatus(booking.id, 'IN_PROGRESS')}
                                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-bold text-lg py-4 rounded-2xl hover:shadow-green-500/30 hover:shadow-xl transition-all active:scale-[0.98]"
                            >
                                Arrived & Start Job ⏱️
                            </button>
                        )}
                        {status === 'IN_PROGRESS' && (
                            <button
                                onClick={() => onUpdateStatus(booking.id, 'COMPLETED')}
                                className="w-full bg-slate-900 text-white font-bold text-lg py-4 rounded-2xl hover:shadow-slate-500/30 hover:shadow-xl transition-all active:scale-[0.98]"
                            >
                                Complete Job ✅
                            </button>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
};
