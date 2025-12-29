'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWebSocket, WebSocketMessage } from '../../../hooks/useWebSocket';
import { ArrowLeft, Eye, Loader2, CheckCircle2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { OTPVerification } from '../../../components/booking/OTPVerification';

interface RequestStatus {
    id: string;
    status: 'broadcasting' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
    viewerCount: number;
    provider?: {
        id: string;
        name: string;
        phone: string;
        rating: number;
        photoUrl?: string;
    };
    service: {
        name: string;
        variant: 'basic' | 'med' | 'full';
        price: number;
    };
    location: string;
    details?: string;
    createdAt: string;
}

// Mock WebSocket URL - will be replaced with actual endpoint
const getWebSocketUrl = (requestId: string) => {
    // For development, we'll use a mock URL
    // In production: `wss://api.thelokals.com/v2/ws/requests/${requestId}`
    return null; // Disabled for now until backend is ready
};

export default function LiveRequestPage() {
    const params = useParams();
    const router = useRouter();
    const requestId = params.id as string;

    const [requestStatus, setRequestStatus] = useState<RequestStatus>({
        id: requestId,
        status: 'broadcasting',
        viewerCount: 0,
        service: {
            name: 'AC Repair & Service',
            variant: 'med',
            price: 550,
        },
        location: 'Narnaund, Haryana',
        createdAt: new Date().toISOString(),
    });

    const [providerAccepted, setProviderAccepted] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const [otp, setOtp] = useState('');

    // WebSocket connection
    const wsUrl = getWebSocketUrl(requestId);
    const { isConnected, isConnecting, error, lastMessage } = useWebSocket(wsUrl, {
        onMessage: (message: WebSocketMessage) => {
            handleWebSocketMessage(message);
        },
        onOpen: () => {
            console.log('Connected to live request updates');
        },
        onError: (error) => {
            console.error('WebSocket error:', error);
        },
    });

    // Handle WebSocket messages
    const handleWebSocketMessage = (message: WebSocketMessage) => {
        switch (message.type) {
            case 'viewer_count_update':
                setRequestStatus((prev) => ({
                    ...prev,
                    viewerCount: message.data.count,
                }));
                break;

            case 'provider_accepted':
                setRequestStatus((prev) => ({
                    ...prev,
                    status: 'accepted',
                    provider: message.data.provider,
                }));
                setProviderAccepted(true);
                toast.success('Provider accepted your request!');
                break;

            case 'provider_arrived':
                setShowOTP(true);
                setOtp(message.data.otp);
                break;

            case 'service_started':
                setRequestStatus((prev) => ({
                    ...prev,
                    status: 'in_progress',
                }));
                break;

            case 'service_completed':
                setRequestStatus((prev) => ({
                    ...prev,
                    status: 'completed',
                }));
                // Navigate to rating page
                setTimeout(() => {
                    router.push(`/rating/${requestId}`);
                }, 2000);
                break;

            case 'status_update':
                setRequestStatus((prev) => ({
                    ...prev,
                    status: message.data.status,
                }));
                break;

            default:
                console.log('Unknown message type:', message.type);
        }
    };

    // Mock viewer count updates (for demo purposes)
    useEffect(() => {
        if (requestStatus.status === 'broadcasting') {
            const interval = setInterval(() => {
                setRequestStatus((prev) => ({
                    ...prev,
                    viewerCount: Math.floor(Math.random() * 8) + 1,
                }));
            }, 3000);

            // Mock provider acceptance after 10 seconds
            const acceptTimeout = setTimeout(() => {
                setRequestStatus((prev) => ({
                    ...prev,
                    status: 'accepted',
                    provider: {
                        id: 'provider-123',
                        name: 'Rajesh Kumar',
                        phone: '+91 98765 43210',
                        rating: 4.8,
                        photoUrl: undefined,
                    },
                }));
                setProviderAccepted(true);
                toast.success('Provider accepted your request!', {
                    icon: '🎉',
                    duration: 4000,
                });

                // Mock provider arrival after 15 seconds
                setTimeout(() => {
                    const mockOTP = Math.floor(100000 + Math.random() * 900000).toString();
                    setOtp(mockOTP);
                    setShowOTP(true);
                    toast.success('Provider has arrived!', {
                        icon: '📍',
                        duration: 3000,
                    });
                }, 15000);
            }, 10000);

            return () => {
                clearInterval(interval);
                clearTimeout(acceptTimeout);
            };
        }
    }, [requestStatus.status]);

    const getStatusColor = () => {
        switch (requestStatus.status) {
            case 'broadcasting':
                return 'text-accent-amber';
            case 'accepted':
                return 'text-success';
            case 'in_progress':
                return 'text-primary';
            case 'completed':
                return 'text-success';
            case 'cancelled':
                return 'text-error';
            default:
                return 'text-muted';
        }
    };

    const getStatusText = () => {
        switch (requestStatus.status) {
            case 'broadcasting':
                return 'Broadcasting to providers...';
            case 'accepted':
                return 'Provider accepted!';
            case 'in_progress':
                return 'Service in progress';
            case 'completed':
                return 'Service completed';
            case 'cancelled':
                return 'Request cancelled';
            default:
                return 'Unknown status';
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-surface border-b border-neutral-200 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                        >
                            <ArrowLeft size={20} className="text-foreground" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">Live Request</h1>
                            <p className="text-sm text-muted">Request #{requestId.slice(0, 8)}</p>
                        </div>
                    </div>

                    {/* Connection Status */}
                    {wsUrl && (
                        <div className="flex items-center gap-2">
                            {isConnecting && (
                                <div className="flex items-center gap-2 text-sm text-muted">
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Connecting...</span>
                                </div>
                            )}
                            {isConnected && (
                                <div className="flex items-center gap-2 text-sm text-success">
                                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                                    <span>Live</span>
                                </div>
                            )}
                            {error && (
                                <div className="flex items-center gap-2 text-sm text-error">
                                    <div className="w-2 h-2 bg-error rounded-full" />
                                    <span>Offline</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Broadcasting Status */}
                <AnimatePresence mode="wait">
                    {requestStatus.status === 'broadcasting' && (
                        <motion.div
                            key="broadcasting"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-8"
                        >
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent-amber/10 to-warning/10 border-2 border-accent-amber/30 p-8">
                                {/* Animated background pulse */}
                                <div className="absolute inset-0 bg-accent-amber/5 animate-pulse-slow" />

                                <div className="relative z-10 text-center">
                                    {/* Broadcasting Icon */}
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.1, 1],
                                            rotate: [0, 5, -5, 0],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                        }}
                                        className="inline-block mb-4"
                                    >
                                        <div className="w-20 h-20 bg-accent-amber rounded-full flex items-center justify-center shadow-lg">
                                            <Eye size={40} className="text-secondary" />
                                        </div>
                                    </motion.div>

                                    <h2 className="text-3xl font-bold text-foreground mb-2">
                                        Broadcasting Your Request
                                    </h2>

                                    {/* Viewer Count */}
                                    <div className="flex items-center justify-center gap-2 text-xl font-semibold text-accent-amber mb-4">
                                        <Eye size={24} />
                                        <motion.span
                                            key={requestStatus.viewerCount}
                                            initial={{ scale: 1.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {requestStatus.viewerCount}
                                        </motion.span>
                                        <span>providers viewing</span>
                                    </div>

                                    <p className="text-muted max-w-md mx-auto">
                                        Your request is being broadcast to nearby providers. You'll be notified when someone accepts.
                                    </p>

                                    {/* Loading Animation */}
                                    <div className="mt-6 flex justify-center gap-2">
                                        {[0, 1, 2].map((i) => (
                                            <motion.div
                                                key={i}
                                                animate={{
                                                    scale: [1, 1.5, 1],
                                                    opacity: [0.5, 1, 0.5],
                                                }}
                                                transition={{
                                                    duration: 1.5,
                                                    repeat: Infinity,
                                                    delay: i * 0.2,
                                                }}
                                                className="w-3 h-3 bg-accent-amber rounded-full"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Provider Accepted */}
                    {requestStatus.status === 'accepted' && requestStatus.provider && (
                        <motion.div
                            key="accepted"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-8"
                        >
                            {/* Burst Animation */}
                            {providerAccepted && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 1 }}
                                    animate={{ scale: 3, opacity: 0 }}
                                    transition={{ duration: 0.8 }}
                                    className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
                                >
                                    <div className="w-40 h-40 bg-success rounded-full blur-3xl" />
                                </motion.div>
                            )}

                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-success/10 to-primary/10 border-2 border-success p-8">
                                <div className="text-center mb-6">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', duration: 0.6 }}
                                        className="inline-block mb-4"
                                    >
                                        <CheckCircle2 size={64} className="text-success" />
                                    </motion.div>
                                    <h2 className="text-3xl font-bold text-foreground mb-2">
                                        Provider Accepted!
                                    </h2>
                                    <p className="text-muted">
                                        {requestStatus.provider.name} will arrive shortly
                                    </p>
                                </div>

                                {/* Provider Details */}
                                <div className="bg-surface rounded-xl p-6 border border-neutral-200">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                            {requestStatus.provider.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-foreground">
                                                {requestStatus.provider.name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-muted">
                                                <span>⭐ {requestStatus.provider.rating}</span>
                                                <span>•</span>
                                                <span>{requestStatus.provider.phone}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-muted">
                                        <Clock size={16} />
                                        <span>Estimated arrival: 15-20 minutes</span>
                                    </div>
                                </div>

                                {/* OTP Verification (shown when provider arrives) */}
                                {showOTP && otp && (
                                    <div className="mt-6">
                                        <OTPVerification
                                            otp={otp}
                                            providerName={requestStatus.provider.name}
                                            onVerified={() => {
                                                setRequestStatus((prev) => ({
                                                    ...prev,
                                                    status: 'in_progress',
                                                }));
                                                toast.success('Service started!');

                                                // Mock service completion after 10 seconds
                                                setTimeout(() => {
                                                    setRequestStatus((prev) => ({
                                                        ...prev,
                                                        status: 'completed',
                                                    }));
                                                    toast.success('Service completed!', {
                                                        icon: '✅',
                                                        duration: 3000,
                                                    });
                                                    // Navigate to rating
                                                    setTimeout(() => {
                                                        router.push(`/rating/${requestId}`);
                                                    }, 2000);
                                                }, 10000);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Request Details */}
                <div className="bg-surface rounded-xl p-6 border border-neutral-200 shadow-sm">
                    <h3 className="text-xl font-bold text-foreground mb-4">Request Details</h3>

                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-muted mb-1">Service</p>
                            <p className="text-lg font-semibold text-foreground">
                                {requestStatus.service.name}
                            </p>
                            <p className="text-sm text-muted capitalize">
                                {requestStatus.service.variant} variant • ₹{requestStatus.service.price}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted mb-1">Location</p>
                            <p className="text-foreground">{requestStatus.location}</p>
                        </div>

                        {requestStatus.details && (
                            <div>
                                <p className="text-sm text-muted mb-1">Additional Details</p>
                                <p className="text-foreground">{requestStatus.details}</p>
                            </div>
                        )}

                        <div>
                            <p className="text-sm text-muted mb-1">Status</p>
                            <p className={`font-semibold ${getStatusColor()}`}>
                                {getStatusText()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Cancel Button (only when broadcasting) */}
                {requestStatus.status === 'broadcasting' && (
                    <div className="mt-6">
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to cancel this request?')) {
                                    toast.success('Request cancelled');
                                    router.push('/');
                                }
                            }}
                            className="w-full px-6 py-3 bg-neutral-200 hover:bg-neutral-300 text-foreground font-semibold rounded-xl transition-colors"
                        >
                            Cancel Request
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
