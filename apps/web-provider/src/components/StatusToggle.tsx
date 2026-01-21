
'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { providerService } from '@thelocals/platform-core';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface StatusToggleProps {
    className?: string;
}

export const StatusToggle = ({ className }: StatusToggleProps) => {
    const { user, profile, refreshProfile } = useAuth();
    const [loading, setLoading] = useState(false);

    // Derive active state from profile
    // Handle both naming conventions just in case (is_active vs isActive)
    const isActive = (profile as any)?.is_active || (profile as any)?.isActive || false;

    const toggleStatus = async () => {
        if (!user?.id || loading) return;

        setLoading(true);
        const newStatus = !isActive;
        const statusString = newStatus ? 'AVAILABLE' : 'OFFLINE';

        try {
            await providerService.updateAvailability(user.id, statusString);
            await refreshProfile(); // Refresh context to update UI globally
            toast.success(newStatus ? "You are now ONLINE" : "You are now OFFLINE");
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error("Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggleStatus}
            disabled={loading}
            className={`
                flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all
                ${isActive
                    ? 'bg-brand-green text-white hover:bg-green-700 shadow-md'
                    : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                }
                ${className}
            `}
        >
            {loading ? (
                <Loader2 size={16} className="animate-spin" />
            ) : (
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-neutral-400'}`} />
            )}
            {isActive ? 'ONLINE' : 'OFFLINE'}
        </button>
    );
};
