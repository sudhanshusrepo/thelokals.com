import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';

interface LocationPermissionStepProps {
    data?: {
        latitude?: number;
        longitude?: number;
        address?: string;
    };
    onUpdate: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export const LocationPermissionStep: React.FC<LocationPermissionStepProps> = ({
    data,
    onUpdate,
    onNext,
    onBack
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
        data?.latitude && data?.longitude ? { lat: data.latitude, lng: data.longitude } : null
    );

    const handleEnableLocation = () => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lng: longitude });
                // In a real app, you might want to reverse geocode here to get a string address
                // For now, we just save the coordinates
                onUpdate({
                    location: {
                        latitude,
                        longitude,
                        // address: "Fetched from coordinates" // Optional: You typically fetch this from an API
                    }
                });
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching location:", err);
                let errorMessage = "Unable to retrieve your location.";
                if (err.code === err.PERMISSION_DENIED) {
                    errorMessage = "Location permission denied. Please enable it in your browser settings to continue.";
                } else if (err.code === err.POSITION_UNAVAILABLE) {
                    errorMessage = "Location information is unavailable.";
                } else if (err.code === err.TIMEOUT) {
                    errorMessage = "The request to get user location timed out.";
                }
                setError(errorMessage);
                setLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    return (
        <Card>
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📍</span>
                </div>
                <h2 className="text-2xl font-bold text-primary mb-2">Enable Location Services</h2>
                <p className="text-muted">
                    We need your location to match you with nearby service requests. This is mandatory to receive bookings.
                </p>
            </div>

            <div className="space-y-6">
                {!location ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex gap-3">
                            <span className="text-blue-600 text-xl">ℹ️</span>
                            <div className="text-sm text-blue-900">
                                <p className="font-medium mb-1">Why is this required?</p>
                                <p className="text-blue-800">
                                    Your visibility to customers depends on your precise location. We use this to calculate travel time and show you relevant jobs.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-center gap-2">
                        <span className="text-status-accepted text-xl">✓</span>
                        <p className="text-green-900 font-medium">Location captured successfully!</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-sm text-red-600 font-medium text-center">{error}</p>
                    </div>
                )}

                <div className="pt-4">
                    {!location ? (
                        <Button
                            onClick={handleEnableLocation}
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Detecting Location...' : '📍 Enable Location'}
                        </Button>
                    ) : (
                        <div className="text-center">
                            <p className="text-xs text-muted mb-4">
                                Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                            </p>
                            <Button
                                onClick={handleEnableLocation}
                                variant="outline"
                                className="w-full mb-2"
                                size="sm"
                            >
                                Update Location
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-4 mt-8">
                <Button variant="outline" onClick={onBack} className="flex-1">
                    ← Back
                </Button>
                <Button
                    onClick={onNext}
                    className="flex-1"
                    disabled={!location || loading}
                >
                    Continue →
                </Button>
            </div>
        </Card>
    );
};
