'use client';

import { useRouter } from 'next/navigation';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { useMyBookings } from '../../hooks/useMyBookings';
import { StatusCard } from '../../components/v2/StatusCard';
import { Surface } from '../../components/ui/Wrappers';
import { Booking } from '@thelocals/platform-core';

export default function BookingsPage() {
    const router = useRouter();
    const { bookings, loading } = useMyBookings();

    return (
        <AuthGuard>
            <div className="min-h-screen bg-neutral-50 pb-24">
                {/* Header */}
                <header className="bg-white border-b border-neutral-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
                    <h1 className="text-xl font-bold text-neutral-900">My Bookings</h1>
                </header>

                {/* Content */}
                <main className="p-4 max-w-md mx-auto space-y-4">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <Surface key={i} className="h-32 animate-pulse bg-gray-200" onClick={() => { }}>
                                <div />
                            </Surface>
                        ))
                    ) : bookings.length > 0 ? (
                        bookings.map(booking => (
                            <Surface key={booking.id} elevated className="!p-0 overflow-hidden" onClick={() => { }}>
                                <StatusCard
                                    booking={{
                                        id: booking.id,
                                        serviceName: (booking as any).serviceName || 'Service',
                                        status: booking.status === 'PENDING' ? 'assigned' : (booking.status.toLowerCase() as any),
                                        date: new Date(booking.scheduled_date || booking.created_at).toLocaleDateString(),
                                        time: new Date(booking.scheduled_date || booking.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                        imageUrl: '/services/ac.jpg'
                                    }}
                                    onClick={() => router.push(`/bookings/${booking.id}`)}
                                />
                            </Surface>
                        ))
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            <div className="text-4xl mb-4">📅</div>
                            <p>No bookings found.</p>
                            <button
                                onClick={() => router.push('/')}
                                className="mt-4 text-lokals-green font-bold hover:underline"
                            >
                                Book a Service
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </AuthGuard>
    );
}
