'use client';

import { useAuth } from '../../contexts/AuthContext';
import { ProviderLayout } from '../../components/layout/ProviderLayout';
import { useEffect, useState } from 'react';
import { bookingService } from '@thelocals/core/services/bookingService';
import { Booking, DbBookingRequest } from '@thelocals/core';
import { MapPin, Calendar, Clock, CheckCircle2, XCircle, Bell } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { JobCard } from '../../components/jobs/JobCard';
import { JobDetailsModal } from '../../components/jobs/JobDetailsModal';

export default function JobsPage() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [requests, setRequests] = useState<DbBookingRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'requests' | 'active' | 'history'>('requests');

    const [selectedJob, setSelectedJob] = useState<Booking | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (user?.id) {
            loadJobs(user.id);
        }
    }, [user]);

    const loadJobs = async (userId: string) => {
        setLoading(true);
        try {
            const [jobsData, requestsData] = await Promise.all([
                bookingService.getWorkerBookings(userId),
                bookingService.getProviderRequests(userId)
            ]);
            setBookings(jobsData);
            setRequests(requestsData);

            // Auto-select tab based on data
            // if (requestsData.length > 0) setActiveTab('requests');
            // else if (jobsData.length > 0) setActiveTab('active');

        } catch (error) {
            toast.error("Failed to load jobs");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (requestId: string) => {
        if (!user?.id) return;
        try {
            await bookingService.acceptBooking(requestId, user.id);
            toast.success("Job Accepted");
            setIsModalOpen(false); // Close modal if open
            loadJobs(user.id);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleReject = async (bookingId: string) => {
        // Logic to ignore/reject
        setIsModalOpen(false);
    }

    const handleJobClick = (booking: Booking) => {
        setSelectedJob(booking);
        setIsModalOpen(true);
    };

    const getFilteredList = () => {
        if (activeTab === 'requests') return requests;
        return bookings.filter(b => {
            if (activeTab === 'active') {
                return ['PENDING', 'CONFIRMED', 'EN_ROUTE', 'IN_PROGRESS'].includes(b.status);
            }
            return ['COMPLETED', 'CANCELLED', 'EXPIRED', 'REJECTED'].includes(b.status);
        });
    };

    const filteredItems = getFilteredList();

    const handleStatusChange = async (bookingId: string, newStatus: any) => {
        if (!user?.id) return;
        try {
            await bookingService.updateBookingStatus(bookingId, newStatus);
            toast.success(`Job Updated to ${newStatus}`);
            setIsModalOpen(false);
            loadJobs(user.id);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <ProviderLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">My Jobs</h1>
                    <p className="text-neutral-500">Manage your bookings and service requests.</p>
                </div>
                <div className="bg-white rounded-lg p-1 border border-neutral-200 flex overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'requests' ? 'bg-primary text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
                    >
                        <Bell size={14} />
                        Requests
                        {requests.length > 0 && (
                            <span className="bg-white/20 text-white px-1.5 rounded-full text-xs">{requests.length}</span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'active' ? 'bg-primary text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
                    >
                        Active Jobs
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'history' ? 'bg-primary text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
                    >
                        History
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-neutral-500">Loading jobs...</div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-neutral-200 border-dashed">
                        <p className="text-neutral-500">No {activeTab} found.</p>
                    </div>
                ) : (
                    filteredItems.map((item: any) => {
                        const isRequest = activeTab === 'requests';
                        const booking = isRequest ? item.bookings : item;
                        // For requests, we need the request ID (item.id), for bookings we just need booking (item)
                        // But UI needs booking details safely.
                        // We will pass item.id as the accept ID if it is a request.

                        if (!booking) return null;

                        return (
                            <JobCard
                                key={item.id}
                                booking={booking}
                                isRequest={isRequest}
                                onAccept={() => handleAccept(item.id)}
                                onClick={() => handleJobClick(booking)}
                            />
                        )
                    })
                )}
            </div>

            <JobDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                booking={selectedJob}
                isRequest={activeTab === 'requests'}
                onAccept={(bookingId) => {
                    // Find the request ID associated with this booking ID if we are in requests tab
                    if (activeTab === 'requests') {
                        const req = requests.find(r => r.booking_id === bookingId);
                        if (req) {
                            handleAccept(req.id);
                        }
                    } else {
                        // Fallback or error, active jobs shouldn't be "accepted"
                    }
                }}
                onReject={handleReject}
                onStatusChange={handleStatusChange}
            />
        </ProviderLayout>
    );
}
