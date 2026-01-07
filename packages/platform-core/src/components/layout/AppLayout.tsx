import React from 'react';

export interface AppLayoutProps {
    header: React.ReactNode;
    bottomNav?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
    header,
    bottomNav,
    children,
    className = '',
}) => {
    return (
        <div className={`min-h-screen bg-[#f0fdf4] dark:bg-slate-900 font-sans ${className}`}>
            {header}

            <main
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
                style={{
                    paddingTop: 'calc(64px + env(safe-area-inset-top))',
                    paddingBottom: bottomNav ? '80px' : '20px', // Space for bottom nav if present
                }}
            >
                {children}
            </main>

            {bottomNav}
        </div>
    );
};
