'use client';

import React, { useEffect, useState } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

interface LiveTrackerProps {
    from: google.maps.LatLngLiteral;
    to: google.maps.LatLngLiteral;
    showEta?: boolean;
}

export const LiveTracker: React.FC<LiveTrackerProps> = ({ from, to, showEta }) => {
    const map = useMap();
    const routesLib = useMapsLibrary('routes');
    const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
    const [eta, setEta] = useState<string | null>(null);

    // Initialize/Update Directions
    useEffect(() => {
        if (!map || typeof google === 'undefined') return;

        const directionsService = new google.maps.DirectionsService();
        // Renderer
        let renderer = directionsRenderer;
        if (!renderer) {
            renderer = new google.maps.DirectionsRenderer({
                map,
                suppressMarkers: false,
                polylineOptions: {
                    strokeColor: "#22CC88",
                    strokeWeight: 5,
                    strokeOpacity: 0.8
                }
            });
            setDirectionsRenderer(renderer);
        } else {
            renderer.setMap(map);
        }

        directionsService.route(
            {
                origin: from,
                destination: to,
                travelMode: google.maps.TravelMode.DRIVING
            },
            (result, status) => {
                if (status === google.maps.DirectionsStatus.OK && result && renderer) {
                    renderer.setDirections(result);
                    if (result.routes[0]?.legs[0]?.duration?.text) {
                        setEta(result.routes[0].legs[0].duration.text);
                    }
                } else {
                    console.error(`error fetching directions ${status}`);
                }
            }
        );

        return () => {
            if (renderer) renderer.setMap(null);
        }
    }, [map, from, to]); // Re-run if from/to changes

    return (
        <>
            {showEta && eta && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full backdrop-blur-md shadow-lg z-10 font-bold text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    ETA: {eta}
                </div>
            )}
        </>
    );
};

