import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { adminService } from '@thelocals/core/services/adminService';
import { Booking } from '@thelocals/core/types';
import { toast } from 'react-hot-toast';
import {
    Calendar,
    MapPin,
    User,
    Briefcase,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function BookingDetails() {
    const router = useRouter();
    const { id } = router.query;
    const { adminUser } = useAuth();

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (id) {
            loadBookingDetails(id as string);
        }
    }, [id]);

    const loadBookingDetails = async (bookingId: string) => {
        setLoading(true);
        try {
            const data = await adminService.getBookingDetails(bookingId);
            setBooking(data);
        } catch (error) {
            toast.error("Failed to load booking details");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (status: string) => {
        if (!booking || !adminUser) return;
        if (!confirm(`Are you sure you want to change status to ${status}?`)) return;

        setProcessing(true);
        try {
            await adminService.updateBookingStatus(
                booking.id,
                status,
                adminUser.id,
                "Admin manual override"
            );
            toast.success(`Booking marked as ${status}`);
            loadBookingDetails(booking.id);
        } catch (error: any) {
            toast.error(error.message || "Failed to update status");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return (
        <AdminLayout>
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        </AdminLayout>
    );

    if (!booking) return (
        <AdminLayout>
            <div className="p-8 text-center text-text-secondary">Booking not found</div>
        </AdminLayout>
    );

    const steps = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];
    const currentStepIndex = steps.indexOf(booking.status) === -1 ? -1 : steps.indexOf(booking.status);
    const isCancelled = booking.status === 'CANCELLED';

    return (
        <AdminLayout>
            <div className="mb-6">
                <Link href="/bookings" className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-4">
                    <ArrowLeft size={18} />
                    <span>Back to Bookings</span>
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-text-primary">Booking #{booking.id.slice(0, 8)}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase 
                                ${booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                    booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-blue-100 text-blue-700'}`}>
                                {booking.status.replace('_', ' ')}
                            </span>
                        </div>
                        <p className="text-text-secondary flex items-center gap-2">
                            <Calendar size={14} />
                            {new Date(booking.created_at).toLocaleString()}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {booking.status === 'PENDING' && (
                            <button
                                onClick={() => handleStatusUpdate('CANCELLED')}
                                disabled={processing}
                                className="btn-danger flex items-center gap-2"
                            >
                                <XCircle size={16} />
                                Reject / Cancel
                            </button>
                        )}
                        {['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(booking.status) && (
                            <button
                                onClick={() => handleStatusUpdate('COMPLETED')}
                                disabled={processing}
                                className="btn-primary flex items-center gap-2"
                            >
                                <CheckCircle size={16} />
                                Force Complete
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Timeline */}
                    <div className="card p-6">
                        <h3 className="font-bold text-lg mb-6">Booking Timeline</h3>
                        {isCancelled ? (
                            <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-lg">
                                <AlertTriangle />
                                <span className="font-medium">This booking was cancelled.</span>
                            </div>
                        ) : (
                            <div className="relative flex justify-between">
                                {steps.map((step, index) => {
                                    const isCompleted = index <= currentStepIndex;
                                    const isCurrent = index === currentStepIndex;

                                    return (
                                        <div key={step} className="flex flex-col items-center relative z-10 w-full">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300
                                                ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}
                                                ${isCurrent ? 'ring-4 ring-green-100' : ''}
                                            `}>
                                                {index + 1}
                                            </div>
                                            <span className={`text-xs mt-2 font-medium ${isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                                                {step.replace('_', ' ')}
                                            </span>

                                            {/* Connector Line */}
                                            {index < steps.length - 1 && (
                                                <div className={`absolute top-4 left-1/2 w-full h-1 -z-10
                                                    ${index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'}
                                                `}></div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Service Details */}
                    <div className="card p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Briefcase size={20} className="text-primary" />
                            Service Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-text-tertiary uppercase font-bold">Service Type</label>
                                <p className="text-text-primary font-medium">{booking.service_category}</p>
                            </div>
                            <div>
                                <label className="text-xs text-text-tertiary uppercase font-bold">Booking Type</label>
                                <p className="text-text-primary font-medium">{booking.booking_type}</p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs text-text-tertiary uppercase font-bold">Location</label>
                                <p className="text-text-primary font-medium flex items-center gap-2">
                                    <MapPin size={16} className="text-text-secondary" />
                                    {booking.address?.formatted || 'Online / Remote'}
                                </p>
                            </div>
                            {booking.notes && (
                                <div className="md:col-span-2 bg-gray-50 p-3 rounded-lg">
                                    <label className="text-xs text-text-tertiary uppercase font-bold">Customer Notes</label>
                                    <p className="text-text-secondary text-sm">{booking.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Financials */}
                    <div className="card p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <DollarSign size={20} className="text-green-600" />
                            Financials
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Base Price</span>
                                <span>₹{((booking.estimated_cost || 0) / 100).toFixed(2)}</span>
                            </div>
                            {booking.final_cost && (
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-text-primary">Final Amount</span>
                                    <span className="text-green-600">₹{(booking.final_cost / 100).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-xs text-text-tertiary uppercase font-bold">Payment Status</span>
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                    ${booking.payment_status === 'PAID' ? 'bg-green-100 text-green-700' :
                                        booking.payment_status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {booking.payment_status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="card p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <User size={20} className="text-blue-600" />
                            Customer
                        </h3>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                {(booking.user?.name || 'U')[0]}
                            </div>
                            <div>
                                <p className="font-medium text-text-primary">{booking.user?.name || 'Unknown'}</p>
                                <p className="text-xs text-text-secondary">ID: {booking.client_id.slice(0, 8)}</p>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            <div className="text-sm">
                                <span className="text-text-tertiary block text-xs">Email</span>
                                {booking.user?.email || 'N/A'}
                            </div>
                            <div className="text-sm">
                                <span className="text-text-tertiary block text-xs">Phone</span>
                                {booking.user?.phone || 'N/A'}
                            </div>
                        </div>
                    </div>

                    {/* Provider Info */}
                    <div className="card p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Briefcase size={20} className="text-purple-600" />
                            Provider
                        </h3>
                        {booking.worker ? (
                            <>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                                        {booking.worker.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-medium text-text-primary">{booking.worker.name}</p>
                                        <p className="text-xs text-text-secondary">{booking.worker.category}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <span className="block text-xl font-bold text-text-primary">{booking.worker.rating}</span>
                                            <span className="text-xs text-text-tertiary">Rating</span>
                                        </div>
                                        <div>
                                            <span className="block text-xl font-bold text-text-primary">{booking.worker.reviewCount}</span>
                                            <span className="text-xs text-text-tertiary">Reviews</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-4 bg-gray-50 rounded-lg text-text-secondary text-sm">
                                No provider assigned yet.
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
}
