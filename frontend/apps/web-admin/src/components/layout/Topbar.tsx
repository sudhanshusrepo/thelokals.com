import { Bell, Search, HelpCircle, User } from 'lucide-react';

export const Topbar = () => {
    return (
        <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-0 md:left-64 z-20 px-6 flex items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-xl">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search users, listings, bookings..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                    <HelpCircle size={20} />
                </button>

                <div className="h-8 w-px bg-gray-200 mx-2"></div>

                <button className="flex items-center gap-3 hover:bg-gray-50 p-1 pr-3 rounded-full transition-colors">
                    <div className="w-8 h-8 bg-accent-primary text-white rounded-full flex items-center justify-center">
                        <User size={16} />
                    </div>
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-medium text-text-primary">Admin User</p>
                        <p className="text-xs text-text-secondary">Super Admin</p>
                    </div>
                </button>
            </div>
        </header>
    );
};
