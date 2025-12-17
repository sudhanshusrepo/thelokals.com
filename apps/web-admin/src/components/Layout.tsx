import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
    children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { adminUser, signOut } = useAuth();
    const pathname = usePathname();

    const navigation = [
        { name: 'Dashboard', path: '/', icon: '📊' },
        { name: 'Live Users', path: '/live-users', icon: '👥' },
        { name: 'Live Jobs', path: '/live-jobs', icon: '🔧' },
        { name: 'Service Control', path: '/service-control', icon: '⚙️', roles: ['super_admin', 'ops_admin'] },
        { name: 'Locations', path: '/locations', icon: '📍' },
        { name: 'Analytics', path: '/analytics', icon: '📈' },
        { name: 'Audit Logs', path: '/audit-logs', icon: '📝' },
    ];

    const filteredNav = navigation.filter(item =>
        !item.roles || item.roles.includes(adminUser?.role || '')
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white">
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-800">
                        <h1 className="text-2xl font-bold">Admin Panel</h1>
                        <p className="text-sm text-gray-400 mt-1">thelokals.com</p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {filteredNav.map(item => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === item.path
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-800'
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* User Info */}
                    <div className="p-4 border-t border-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">{adminUser?.email}</p>
                                <p className="text-xs text-gray-400 capitalize">{adminUser?.role.replace('_', ' ')}</p>
                            </div>
                            <button
                                onClick={signOut}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                                title="Sign out"
                            >
                                🚪
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="ml-64">
                {children}
            </div>
        </div>
    );
};
