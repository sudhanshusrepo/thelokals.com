import {
    LayoutDashboard,
    Store,
    Users,
    Calendar,
    CreditCard,
    FileText,
    ShieldCheck,
    Settings,
    BarChart3,
    AlertCircle
} from 'lucide-react';
import { SidebarItem } from './SidebarItem';

export const Sidebar = () => {
    return (
        <aside className="w-64 bg-bg-sidebar border-r border-gray-200 h-screen fixed left-0 top-0 overflow-y-auto hidden md:block z-30">
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">L</span>
                    </div>
                    <span className="text-xl font-bold text-accent-primary">lokals</span>
                </div>
                <p className="text-xs text-text-tertiary mt-1 ml-10">Admin Dashboard</p>
            </div>

            <nav className="p-4 space-y-8">
                <div>
                    <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3 px-4">Main</p>
                    <div className="space-y-1">
                        <SidebarItem href="/Dashboard" icon={LayoutDashboard} label="Dashboard" />
                        <SidebarItem href="/listings" icon={Store} label="Listings" />
                        <SidebarItem href="/partners" icon={Users} label="Partners" />
                        <SidebarItem href="/bookings" icon={Calendar} label="Bookings" />
                    </div>
                </div>

                <div>
                    <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3 px-4">Operations</p>
                    <div className="space-y-1">
                        <SidebarItem href="/payments" icon={CreditCard} label="Payments" />
                        <SidebarItem href="/verifications" icon={ShieldCheck} label="Verifications & KYC" />
                        <SidebarItem href="/disputes" icon={AlertCircle} label="Disputes" />
                    </div>
                </div>

                <div>
                    <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3 px-4">Reports & Config</p>
                    <div className="space-y-1">
                        <SidebarItem href="/reports" icon={BarChart3} label="Reports" />
                        <SidebarItem href="/audit-logs" icon={FileText} label="Audit Logs" />
                        <SidebarItem href="/settings" icon={Settings} label="Settings" />
                    </div>
                </div>
            </nav>
        </aside>
    );
};
