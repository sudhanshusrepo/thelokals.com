import React, { useEffect, useState } from 'react';
import { DirectionsRenderer } from '@react-google-maps/api';

interface LiveTrackerProps {
    from: google.maps.LatLngLiteral;
    to: google.maps.LatLngLiteral;
    showEta?: boolean;
}

export const LiveTracker: React.FC<LiveTrackerProps> = ({ from, to, showEta }) => {
    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
    const [eta, setEta] = useState<string | null>(null);

    useEffect(() => {
        const directionsService = new google.maps.DirectionsService();

        directionsService.route(
            {
                origin: from,
                destination: to,
                travelMode: google.maps.TravelMode.DRIVING
            },
            (result, status) => {
                if (status === google.maps.DirectionsStatus.OK && result) { // Check result exists
                    setDirections(result);
                    if (result.routes[0]?.legs[0]?.duration?.text) {
                        setEta(result.routes[0].legs[0].duration.text);
                    }
                } else {
                    console.error(`error fetching directions ${result}`);
                }
            }
        );
    }, [from, to]);

    return (
        <>
            {directions && (
                <DirectionsRenderer
                    directions={directions}
                    options={{
                        suppressMarkers: false, // Let GMaps handle markers for now, or true if customizing icons
                        polylineOptions: {
                            strokeColor: "#22CC88",
                            strokeWeight: 5,
                            strokeOpacity: 0.8
                        }
                    }}
                />
            )}

            {showEta && eta && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full backdrop-blur-md shadow-lg z-10 font-bold text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    ETA: {eta}
                </div>
            )}
        </>
    );
};
