'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { adminService, Customer } from "@thelocals/platform-core";
import { toast } from 'react-hot-toast';
import { Search, Mail, Phone, Calendar } from 'lucide-react';
import { Card } from '../../components/ui/Card';

export default function ClientsPage() {
    const [clients, setClients] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        setLoading(true);
        try {
            const data = await adminService.getAllCustomers();
            setClients(data);
        } catch (error) {
            toast.error("Failed to load clients");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = clients.filter(client =>
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.includes(searchTerm)
    );

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Clients</h1>
                    <p className="text-sm text-neutral-500">View and manage registered customers.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                </div>
            </div>

            <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-100">
                            <tr>
                                <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-500 uppercase tracking-wider">User</th>
                                <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Contact</th>
                                <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Joined</th>
                                <th className="text-right py-3 px-6 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-neutral-500">Loading clients...</td>
                                </tr>
                            ) : filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-neutral-500">No clients found matching your search.</td>
                                </tr>
                            ) : (
                                filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-neutral-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                    {client.full_name?.[0] || client.email?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-neutral-900 block">{client.full_name || 'Unnamed User'}</span>
                                                    <span className="text-xs text-neutral-400">ID: {client.id.slice(0, 8)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-sm text-neutral-600">
                                                    <Mail size={14} className="text-neutral-400" />
                                                    <span>{client.email || '-'}</span>
                                                </div>
                                                {client.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                                                        <Phone size={14} className="text-neutral-400" />
                                                        <span>{client.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2 text-sm text-neutral-600">
                                                <Calendar size={14} className="text-neutral-400" />
                                                <span>{client.created_at ? new Date(client.created_at).toLocaleDateString() : '-'}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex justify-end">
                                                <button className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">
                                                    View Details
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </AdminLayout>
    );
}
