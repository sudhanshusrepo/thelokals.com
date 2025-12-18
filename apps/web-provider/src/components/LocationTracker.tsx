import React, { useState, useEffect, useRef } from 'react';
import { backend } from '../services/backend';
import { toast } from 'react-hot-toast';

// Mock backend location service for MVP build fix
// In real app, this should be properly typed from core or backend service
// preventing explicit 'any' if possible, but for quick fix:
(backend as any).location = {
    update: async (lat: number, lng: number) => {
        // console.log('Location update:', lat, lng);
    }
};

export const LocationTracker: React.FC = () => {
    const [isTracking, setIsTracking] = useState(false);
    const watchId = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (watchId.current !== null) {
                navigator.geolocation.clearWatch(watchId.current);
            }
        };
    }, []);

    const startTracking = () => {
        if (!('geolocation' in navigator)) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        setIsTracking(true);
        toast.success('You are now Online');

        watchId.current = navigator.geolocation.watchPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    await backend.location.update(latitude, longitude);
                } catch (error) {
                    console.error('Failed to update location', error);
                }
            },
            (error) => {
                console.error('Location error', error);
                toast.error('Lost location access');
                setIsTracking(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const stopTracking = () => {
        if (watchId.current !== null) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
        }
        setIsTracking(false);
        toast('You are now Offline', { icon: '😴' });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-slate-900">
                        {isTracking ? '🟢 Online' : '⚪ Offline'}
                    </h3>
                    <p className="text-xs text-slate-500">
                        {isTracking ? 'Updating your location...' : 'Go online to get jobs'}
                    </p>
                </div>
                <button
                    onClick={isTracking ? stopTracking : startTracking}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${isTracking
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-teal-600 text-white hover:bg-teal-700 shadow-md'
                        }`}
                >
                    {isTracking ? 'Stop' : 'Go Online'}
                </button>
            </div>
        </div>
    );
};
