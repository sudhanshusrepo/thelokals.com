import Link from 'next/link';
import { useRouter } from 'next/router';
import { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
    href: string;
    icon: LucideIcon;
    label: string;
}

export const SidebarItem = ({ href, icon: Icon, label }: SidebarItemProps) => {
    const router = useRouter();
    const isActive = router.pathname === href;

    return (
        <Link
            href={href}
            className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
        >
            <Icon size={20} />
            <span>{label}</span>
        </Link>
    );
};
