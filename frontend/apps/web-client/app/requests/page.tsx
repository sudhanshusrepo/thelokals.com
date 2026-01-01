'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Star, MapPin, ChevronRight } from 'lucide-react';

interface Request {
    id: string;
    service: string;
    variant: 'basic' | 'med' | 'full';
    price: number;
    status: 'broadcasting' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
    provider?: {
        name: string;
        rating: number;
    };
    location: string;
    createdAt: string;
}

// Mock data
const mockRequests: Request[] = [
    {
        id: 'req_1',
        service: 'AC Repair & Service',
        variant: 'med',
        price: 550,
        status: 'in_progress',
        provider: { name: 'Rajesh Kumar', rating: 4.8 },
        location: 'Narnaund, Haryana',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
        id: 'req_2',
        service: 'Plumbing Services',
        variant: 'basic',
        price: 350,
        status: 'completed',
        provider: { name: 'Amit Singh', rating: 4.5 },
        location: 'Narnaund, Haryana',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
];

export default function RequestsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

    const activeRequests = mockRequests.filter(r => ['broadcasting', 'accepted', 'in_progress'].includes(r.status));
    const pastRequests = mockRequests.filter(r => ['completed', 'cancelled'].includes(r.status));

    const getStatusColor = (status: Request['status']) => {
        const colors = {
            broadcasting: 'text-accent-amber bg-accent-amber/10',
            accepted: 'text-primary bg-primary/10',
            in_progress: 'text-primary bg-primary/10',
            completed: 'text-success bg-success/10',
            cancelled: 'text-error bg-error/10',
        };
        return colors[status] || 'text-muted bg-neutral-100';
    };

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-50 bg-surface border-b border-neutral-200 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold">My Requests</h1>
                        <p className="text-sm text-muted">View your service history</p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex gap-2 mb-6 bg-surface rounded-xl p-1 border border-neutral-200">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'active' ? 'bg-primary text-white shadow-md' : 'text-muted'
                            }`}
                    >
                        Active ({activeRequests.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'past' ? 'bg-primary text-white shadow-md' : 'text-muted'
                            }`}
                    >
                        Past ({pastRequests.length})
                    </button>
                </div>

                <div className="space-y-4">
                    {(activeTab === 'active' ? activeRequests : pastRequests).map((request) => (
                        <motion.div
                            key={request.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => router.push(`/live-request/${request.id}`)}
                            className="bg-surface rounded-xl p-6 border border-neutral-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold mb-1">{request.service}</h3>
                                    <p className="text-sm text-muted capitalize">{request.variant} • ₹{request.price}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                                    {request.status.replace('_', ' ')}
                                </span>
                            </div>

                            {request.provider && (
                                <div className="flex items-center gap-2 text-sm mb-2">
                                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        {request.provider.name.charAt(0)}
                                    </div>
                                    <span className="font-medium">{request.provider.name}</span>
                                    <span className="text-muted">•</span>
                                    <Star size={14} className="text-accent-amber fill-accent-amber" />
                                    <span className="text-muted">{request.provider.rating}</span>
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-sm text-muted mb-2">
                                <MapPin size={14} />
                                <span>{request.location}</span>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                                <div className="flex items-center gap-2 text-sm text-muted">
                                    <Clock size={14} />
                                    <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                                </div>
                                <ChevronRight size={20} className="text-muted" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
}
