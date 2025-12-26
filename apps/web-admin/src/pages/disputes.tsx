import Link from 'next/link';
import { AlertCircle, Search } from 'lucide-react';

export default function Disputes() {
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
                            <h1 className="text-2xl font-bold text-white">Disputes Center</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search / Filter Toolbar Placeholder */}
                <div className="mb-8 flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-3 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search disputes by booking ID or User..."
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 p-2 text-white outline-none focus:border-purple-500 transition"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-600">All Status</button>
                    </div>
                </div>

                {/* Empty State / List */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-12 text-center">
                    <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="text-slate-400" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Active Disputes</h3>
                    <p className="text-slate-400 max-w-md mx-auto">
                        Great work! There are currently no disputes requiring your attention.
                        New disputes will appear here when customers or providers raise an issue.
                    </p>
                </div>
            </main>
        </div>
    );
}
