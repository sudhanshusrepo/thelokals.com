
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, Wallet, User } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface NavItemProps {
    href: string;
    icon: LucideIcon;
    label: string;
    isActive: boolean;
}

const NavItem = ({ href, icon: Icon, label, isActive }: NavItemProps) => (
    <Link href={href} className={`flex flex-col items-center justify-center p-2 flex-1 transition-all duration-200 ${isActive ? 'text-brand-text' : 'text-neutral-400'}`}>
        <div className={`p-1.5 rounded-xl mb-1 transition-all ${isActive ? 'bg-brand-green/20' : 'bg-transparent'}`}>
            <Icon size={24} className={isActive ? 'text-brand-green' : 'text-neutral-400'} strokeWidth={isActive ? 2.5 : 2} />
        </div>
        <span className={`text-[10px] font-medium ${isActive ? 'text-brand-text' : 'text-neutral-400'}`}>
            {label}
        </span>
    </Link>
);

export const MobileBottomNav = () => {
    const pathname = usePathname();

    const tabs = [
        { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/jobs', icon: Briefcase, label: 'Jobs' },
        { href: '/earnings', icon: Wallet, label: 'Earnings' },
        { href: '/profile', icon: User, label: 'Profile' },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 dark:border-neutral-800 pb-safe pt-2 px-2 z-50 shadow-2xl shadow-neutral-900/10">
            <div className="flex items-center justify-around">
                {tabs.map((tab) => (
                    <NavItem
                        key={tab.href}
                        href={tab.href}
                        icon={tab.icon}
                        label={tab.label}
                        isActive={pathname === tab.href || (tab.href !== '/' && pathname?.startsWith(tab.href))}
                    />
                ))}
            </div>
        </div>
    );
};
