'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { adminService, AdminAuditLog } from "@thelocals/platform-core";
import { toast } from 'react-hot-toast';
import { FileText, Clock, User, ChevronDown, ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

import { useAuditLogs } from '../../hooks/useAdminData';

export default function AuditLogsPage() {
    const { logs, isLoading: loading } = useAuditLogs();
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

    // Removed useEffect/loadLogs

    const toggleExpand = (id: string) => {
        setExpandedLogId(expandedLogId === id ? null : id);
    };

    const getActionColor = (action: string) => {
        if (action.includes('delete') || action.includes('reject')) return 'error';
        if (action.includes('update') || action.includes('edit')) return 'info';
        if (action.includes('create') || action.includes('verify') || action.includes('approve')) return 'success';
        return 'neutral';
    };

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Audit Trail</h1>
                    <p className="text-sm text-neutral-500">Security and action logs for compliance.</p>
                </div>
            </div>

            <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-100">
                            <tr>
                                <th className="w-8 py-3 px-4"></th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Timestamp</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Admin</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Action</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Target</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-neutral-500">Loading logs...</td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-neutral-500">No logs found.</td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <React.Fragment key={log.id}>
                                        <tr
                                            onClick={() => toggleExpand(log.id)}
                                            className={`hover:bg-neutral-50 transition-colors cursor-pointer ${expandedLogId === log.id ? 'bg-neutral-50' : ''}`}
                                        >
                                            <td className="py-3 px-4 text-neutral-400">
                                                {expandedLogId === log.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-neutral-600">
                                                    <Clock size={14} className="text-neutral-400" />
                                                    <span>{new Date(log.created_at).toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-600">
                                                        <User size={12} />
                                                    </div>
                                                    <span className="text-sm font-medium text-neutral-900 truncate max-w-[150px]">{log.admin_user_id}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant={getActionColor(log.action)}>
                                                    {log.action}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-neutral-600 font-mono">
                                                    {log.resource_type}:{log.resource_id?.slice(0, 8)}
                                                </span>
                                            </td>
                                        </tr>
                                        {expandedLogId === log.id && (
                                            <tr className="bg-neutral-50/50">
                                                <td colSpan={5} className="p-4 pl-12 border-t border-neutral-100">
                                                    <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Change Details</h4>
                                                    <pre className="bg-white border border-neutral-200 rounded-lg p-3 text-xs font-mono text-neutral-700 overflow-x-auto">
                                                        {JSON.stringify(log.changes || {}, null, 2)}
                                                    </pre>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </AdminLayout>
    );
}
