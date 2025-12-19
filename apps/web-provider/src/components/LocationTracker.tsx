import React, { useState, useEffect, useRef } from 'react';
import { backend } from '../services/backend';
import { toast } from 'react-hot-toast';
import { geoService } from '@thelocals/core/services/geoService';

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
                    await geoService.updateLocation(latitude, longitude);
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
                        : 'bg-primary text-white hover:bg-blue-700 shadow-md'
                        }`}
                >
                    {isTracking ? 'Stop' : 'Go Online'}
                </button>
            </div>
        </div>
    );
};
