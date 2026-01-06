'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
    href: string;
    icon: LucideIcon;
    label: string;
}

export const SidebarItem = ({ href, icon: Icon, label }: SidebarItemProps) => {
    const pathname = usePathname();
    const isActive = pathname === href || pathname?.startsWith(`${href}/`);

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium
                ${isActive
                    ? 'bg-gradient-to-r from-brand-yellow/20 to-brand-green/20 text-brand-text border-l-4 border-brand-green shadow-sm'
                    : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 group-hover:translate-x-1'
                }`}
        >
            <Icon size={20} />
            <span>{label}</span>
        </Link>
    );
};
