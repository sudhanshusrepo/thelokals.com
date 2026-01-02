import React, { useEffect, useState } from 'react';
import { adminService } from '@thelocals/core/services/adminService';
import { AdminAuditLog } from '@thelocals/core/types';
import { toast } from 'react-hot-toast';
import { ShieldAlert, RefreshCw, User } from 'lucide-react';
import Link from 'next/link';

export default function AuditLogs() {
    const [logs, setLogs] = useState<AdminAuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await adminService.getAuditLogs();
            setLogs(data);
        } catch (error: any) {
            toast.error("Failed to load audit logs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="text-slate-400 hover:text-white transition">
                                ← Back
                            </Link>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                <ShieldAlert className="text-purple-400" />
                                Audit Logs
                            </h1>
                        </div>
                        <button
                            onClick={fetchLogs}
                            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition"
                            title="Refresh"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/50 border-b border-slate-700 text-slate-300 text-sm uppercase tracking-wider">
                                    <th className="p-4 font-semibold">Timestamp</th>
                                    <th className="p-4 font-semibold">Admin</th>
                                    <th className="p-4 font-semibold">Action</th>
                                    <th className="p-4 font-semibold">Resource</th>
                                    <th className="p-4 font-semibold">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700 text-slate-300 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-500">Loading logs...</td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-500">No audit logs found.</td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-700/30 transition">
                                            <td className="p-4 whitespace-nowrap text-slate-400">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                            <td className="p-4 flex items-center gap-2">
                                                <User size={14} className="text-slate-500" />
                                                {log.admin_user_id.slice(0, 8)}...
                                            </td>
                                            <td className="p-4 font-mono text-purple-300">
                                                {log.action}
                                            </td>
                                            <td className="p-4">
                                                <span className="bg-slate-700 px-2 py-1 rounded text-xs text-slate-300">
                                                    {log.resource_type}:{log.resource_id?.slice(0, 6)}
                                                </span>
                                            </td>
                                            <td className="p-4 max-w-md truncate text-slate-500" title={JSON.stringify(log.changes)}>
                                                {JSON.stringify(log.changes)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
