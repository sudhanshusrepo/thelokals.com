import React, { useState } from 'react';

export function Tabs({ children, defaultValue, className = '' }: { children: React.ReactNode; defaultValue: string; className?: string }) {
    const [activeTab, setActiveTab] = useState(defaultValue);

    return (
        <div className={className} data-active-tab={activeTab}>
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<any>, { activeTab, setActiveTab });
                }
                return child;
            })}
        </div>
    );
}

export function TabsList({ children, activeTab, setActiveTab }: { children: React.ReactNode; activeTab?: string; setActiveTab?: (tab: string) => void }) {
    return (
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1">
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<any>, { activeTab, setActiveTab });
                }
                return child;
            })}
        </div>
    );
}

export function TabsTrigger({ children, value, activeTab, setActiveTab }: { children: React.ReactNode; value: string; activeTab?: string; setActiveTab?: (tab: string) => void }) {
    const isActive = activeTab === value;

    return (
        <button
            onClick={() => setActiveTab?.(value)}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${isActive
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
        >
            {children}
        </button>
    );
}

export function TabsContent({ children, value, activeTab, className = '' }: { children: React.ReactNode; value: string; activeTab?: string; className?: string }) {
    if (activeTab !== value) return null;

    return (
        <div className={className}>
            {children}
        </div>
    );
}
