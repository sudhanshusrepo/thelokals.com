import { useState } from 'react';
import { adminService } from '@thelocals/core/services/adminService';
import { ReportType } from '@thelocals/core/types';
import { downloadCSV } from '../utils/csvExport';
import { toast } from 'react-hot-toast';
import { FileDown, Calendar, Filter } from 'lucide-react';
import Link from 'next/link';

export default function Reports() {
    const [reportType, setReportType] = useState<ReportType>('BOOKINGS');
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<any[]>([]);

    // Date Range State (Default: Last 30 Days)
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const generateReport = async () => {
        setLoading(true);
        try {
            const data = await adminService.getReportData(reportType, {
                dateRange,
                status: 'ALL' // Can expand to have status filter UI
            });
            setReportData(data);
            if (data.length === 0) {
                toast("No data found for selected criteria", { icon: 'ℹ️' });
            } else {
                toast.success(`Generated ${data.length} rows`);
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (reportData.length === 0) return toast.error("Generate a report first");
        const filename = `${reportType}_Report_${dateRange.start}_${dateRange.end}.csv`;
        downloadCSV(reportData, filename);
        toast.success("Download started");
    };

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
                            <h1 className="text-2xl font-bold text-white">Analytics & Reports</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Controls */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        {/* Report Type */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Report Type</label>
                            <select
                                value={reportType}
                                onChange={(e) => {
                                    setReportType(e.target.value as ReportType);
                                    setReportData([]); // Clear previous data on switch
                                }}
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                            >
                                <option value="BOOKINGS">Bookings Overview</option>
                                <option value="FINANCIAL">Financial / Revenue</option>
                                <option value="PROVIDERS">Provider Performance</option>
                            </select>
                        </div>

                        {/* Date Start */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Start Date</label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-3 top-3.5 text-slate-500" />
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        {/* Date End */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">End Date</label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-3 top-3.5 text-slate-500" />
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={generateReport}
                            disabled={loading}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition shadow-lg shadow-purple-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Filter size={18} />
                            )}
                            Generate Report
                        </button>
                    </div>
                </div>

                {/* Results Preview */}
                {reportData.length > 0 && (
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-6 border-b border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-white">Report Preview</h2>
                                <p className="text-slate-400 text-sm mt-1">Showing first 10 rows of {reportData.length} records</p>
                            </div>
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold transition shadow-lg shadow-green-900/20"
                            >
                                <FileDown size={18} />
                                Download CSV
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900/50 border-b border-slate-700 text-slate-300 text-sm uppercase tracking-wider">
                                        {Object.keys(reportData[0]).map((header) => (
                                            <th key={header} className="p-4 font-semibold whitespace-nowrap">{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700 text-slate-300">
                                    {reportData.slice(0, 10).map((row, i) => (
                                        <tr key={i} className="hover:bg-slate-700/30 transition">
                                            {Object.values(row).map((val: any, idx) => (
                                                <td key={idx} className="p-4 whitespace-nowrap">
                                                    {val !== null && val !== undefined ? String(val) : '-'}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {reportData.length > 10 && (
                            <div className="p-4 bg-slate-900/30 text-center text-slate-500 text-sm border-t border-slate-700">
                                ... and {reportData.length - 10} more rows. Download CSV to view all.
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
