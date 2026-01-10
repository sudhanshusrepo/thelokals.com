'use client';
import React, { useState } from 'react';
import { MapPin, Edit, Loader2, AlertCircle, User, LogIn } from 'lucide-react';
import { useLocation } from '../../contexts/LocationContext';
import { AddressEditor } from './AddressEditor';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface LocationSearchBarProps {
    onLocationSelect?: (address: string, lat: number, lng: number) => void;
}

const UserButton = () => {
    const { user } = useAuth();
    const router = useRouter();

    if (user) {
        return (
            <button
                onClick={() => router.push('/profile')}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors"
            >
                <User size={20} />
            </button>
        );
    }

    return (
        <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 rounded-full bg-black text-white text-sm font-bold shadow-md hover:bg-gray-900 transition-all active:scale-95 flex items-center gap-2"
        >
            <LogIn size={16} />
            Login
        </button>
    );
};

export const LocationSearchBar: React.FC<LocationSearchBarProps> = ({ onLocationSelect }) => {
    const { locationState, updateLocation, detectLocation } = useLocation();
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    const { address, status, latitude, longitude } = locationState;

    // Derived display text
    const displayText = status === 'detecting'
        ? 'Detecting Location...'
        : status === 'error'
            ? 'Location Unavailable'
            : address || 'Set Location';

    const handleConfirmAddress = (newAddr: string, lat: number, lng: number) => {
        updateLocation(lat, lng, newAddr);
        setIsEditorOpen(false);
        if (onLocationSelect) onLocationSelect(newAddr, lat, lng);
    };

    return (
        <>
            <div className="sticky top-0 bg-white/95 backdrop-blur-md p-4 z-40 rounded-b-2xl shadow-sm border-b border-gray-100">
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => setIsEditorOpen(true)}
                >
                    {/* Status Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${status === 'error' ? 'bg-red-50 text-red-500' : 'bg-lokals-green/10 text-lokals-green'
                        }`}>
                        {status === 'detecting' ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : status === 'error' ? (
                            <AlertCircle size={18} />
                        ) : (
                            <MapPin size={18} />
                        )}
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                            {status === 'resolved' ? 'Your Location' : 'Status'}
                        </p>
                        <p className={`text-sm font-bold truncate pr-2 ${status === 'error' ? 'text-red-500' : 'text-gray-900'
                            }`}>
                            {displayText}
                        </p>
                    </div>

                    {/* Action Button */}
                    <button
                        className="p-2 text-gray-400 hover:text-lokals-green hover:bg-gray-50 rounded-full transition-colors group-hover:bg-gray-50"
                        onClick={(e) => { e.stopPropagation(); setIsEditorOpen(true); }}
                    >
                        <Edit size={18} />
                    </button>
                </div>

                {/* User Profile / Login - Restored */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <UserButton />
                </div>
            </div>

            {/* Manual Editor Modal */}
            {isEditorOpen && (
                <AddressEditor
                    initialPosition={latitude && longitude ? { lat: latitude, lng: longitude } : { lat: 19.0760, lng: 72.8777 }} // Default to Mumbai
                    initialAddress={address || ''}
                    onConfirm={handleConfirmAddress}
                    onClose={() => setIsEditorOpen(false)}
                />
            )}
        </>
    );
};
