import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

export const OperationalWidgets = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pending Approvals */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-text-primary">Pending Approvals</h3>
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                        <Clock size={20} />
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100 cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                AC
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-text-primary">Cool Air Services</p>
                                <p className="text-xs text-text-secondary">New Partner</p>
                            </div>
                        </div>
                        <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">Review</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100 cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                JD
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-text-primary">John Doe</p>
                                <p className="text-xs text-text-secondary">KYC Update</p>
                            </div>
                        </div>
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">Verify</span>
                    </div>
                </div>
                <button className="w-full mt-4 text-sm text-center text-primary font-medium hover:text-primary-hover">
                    View all pending ({12})
                </button>
            </div>

            {/* System Health */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-text-primary">System Health</h3>
                    <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                        <CheckCircle size={20} />
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-sm text-text-secondary">API Uptime</span>
                        </div>
                        <span className="text-sm font-medium text-text-primary">99.9%</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-sm text-text-secondary">Payment Gateway</span>
                        </div>
                        <span className="text-sm font-medium text-text-primary">Operational</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            <span className="text-sm text-text-secondary">SMS Service</span>
                        </div>
                        <span className="text-sm font-medium text-text-primary">Degraded</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-sm text-text-secondary">Email Service</span>
                        </div>
                        <span className="text-sm font-medium text-text-primary">Operational</span>
                    </div>
                </div>
            </div>

            {/* Support Tickets */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-text-primary">Support & Flags</h3>
                    <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                        <AlertCircle size={20} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                        <p className="text-2xl font-bold text-red-600">5</p>
                        <p className="text-xs text-red-800 font-medium">Critical Issues</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                        <p className="text-2xl font-bold text-blue-600">23</p>
                        <p className="text-xs text-blue-800 font-medium">Open Tickets</p>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="text-xs flex justify-between text-text-secondary">
                        <span>Ticket #1239 - Refund Dispute</span>
                        <span className="text-red-500 font-medium">High</span>
                    </div>
                    <div className="text-xs flex justify-between text-text-secondary">
                        <span>Ticket #1235 - Login Issue</span>
                        <span className="text-orange-500 font-medium">Med</span>
                    </div>
                </div>
                <button className="w-full mt-4 text-sm text-center text-primary font-medium hover:text-primary-hover">
                    Go to Helpdesk
                </button>
            </div>
        </div>
    );
};
