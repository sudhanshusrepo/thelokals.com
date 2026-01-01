import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export interface BottomNavItem {
    label: string;
    to: string;
    icon: React.ReactNode | string;
    badge?: number;
}

export interface BottomNavProps {
    items: BottomNavItem[];
    className?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ items, className = '' }) => {
    const location = useLocation();

    return (
        <nav
            className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t dark:border-slate-700 flex justify-around max-w-7xl mx-auto rounded-t-2xl shadow-lg z-40 ${className}`}
            role="navigation"
            aria-label="Bottom Navigation"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            {items.map((item, index) => {
                const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
                return (
                    <Link
                        key={index}
                        to={item.to}
                        className={`relative flex flex-col items-center justify-center flex-1 p-3 text-xs font-semibold transition-colors ${isActive ? 'text-teal-600' : 'text-slate-500'}`}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        {typeof item.icon === 'string' ? (
                            <span className="text-lg mb-1">{item.icon}</span>
                        ) : (
                            <span className="mb-1">{item.icon}</span>
                        )}
                        {item.label}
                        {item.badge !== undefined && item.badge > 0 && (
                            <span className="absolute top-1 right-1/4 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {item.badge > 9 ? '9+' : item.badge}
                            </span>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
};
