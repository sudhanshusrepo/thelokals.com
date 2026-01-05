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
    AlertCircle,
    LucideIcon,
    Briefcase
} from 'lucide-react';

import { AdminRole } from '@thelocals/core/types';

export interface NavigationItem {
    label: string;
    href: string;
    icon: LucideIcon;
    allowedRoles?: AdminRole[];
}

export interface NavigationSection {
    title: string;
    items: NavigationItem[];
}

export const ADMIN_NAVIGATION: NavigationSection[] = [
    {
        title: 'Main',
        items: [
            { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { label: 'Clients', href: '/clients', icon: Users },
            { label: 'Partners', href: '/partners', icon: Briefcase },
            { label: 'Listings', href: '/listings', icon: Store },
            { label: 'Bookings', href: '/bookings', icon: Calendar },
        ]
    },
    {
        title: 'Operations',
        items: [
            { label: 'Payments', href: '/payments', icon: CreditCard, allowedRoles: ['SUPER_ADMIN', 'FINANCE_ADMIN'] },
            { label: 'Verifications & KYC', href: '/verifications', icon: ShieldCheck, allowedRoles: ['SUPER_ADMIN', 'OPS_ADMIN', 'SUPPORT_ADMIN'] },
            { label: 'Disputes', href: '/disputes', icon: AlertCircle, allowedRoles: ['SUPER_ADMIN', 'SUPPORT_ADMIN', 'OPS_ADMIN'] },
        ]
    },
    {
        title: 'Reports & Config',
        items: [
            { label: 'Reports', href: '/reports', icon: BarChart3, allowedRoles: ['SUPER_ADMIN', 'FINANCE_ADMIN', 'OPS_ADMIN'] },
            { label: 'Audit Logs', href: '/audit-logs', icon: FileText, allowedRoles: ['SUPER_ADMIN'] },
            { label: 'Settings', href: '/settings', icon: Settings, allowedRoles: ['SUPER_ADMIN', 'OPS_ADMIN'] },
        ]
    }
];
