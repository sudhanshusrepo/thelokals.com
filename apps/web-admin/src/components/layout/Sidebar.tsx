'use client';

import { ADMIN_NAVIGATION } from '../../config/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { SidebarItem } from './SidebarItem';

export const Sidebar = () => {
    const { adminUser } = useAuth();
    return (
        <aside className="w-64 bg-white border-r border-neutral-200 h-screen fixed left-0 top-0 overflow-y-auto hidden md:block z-30">
            <div className="p-6 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">L</span>
                    </div>
                    <span className="text-xl font-bold text-primary">lokals</span>
                </div>
                <p className="text-xs text-neutral-400 mt-1 ml-10">Admin Dashboard</p>
            </div>

            <nav className="p-4 space-y-8">
                {ADMIN_NAVIGATION.map((section) => {
                    const filteredItems = section.items.filter(item =>
                        !item.allowedRoles || (adminUser && item.allowedRoles.includes(adminUser.role))
                    );

                    if (filteredItems.length === 0) return null;

                    return (
                        <div key={section.title}>
                            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 px-4">
                                {section.title}
                            </p>
                            <div className="space-y-1">
                                {filteredItems.map((item) => (
                                    <SidebarItem
                                        key={item.href}
                                        href={item.href}
                                        icon={item.icon}
                                        label={item.label}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
};
