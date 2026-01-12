import React, { useEffect, useRef, useState, Children, cloneElement, isValidElement } from 'react';

// Native implementation to avoid library conflicts
interface GoogleMapProps {
    apiKey?: string; // Ignored, as we use global script
    className?: string;
    defaultCenter?: google.maps.LatLngLiteral;
    defaultZoom?: number;
    children?: React.ReactNode;
    mapId?: string;
    options?: google.maps.MapOptions;
}

export function GoogleMap({ className, defaultCenter, defaultZoom, children, mapId, options }: GoogleMapProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);

    useEffect(() => {
        if (!ref.current || !window.google) return;

        const mapInstance = new window.google.maps.Map(ref.current, {
            center: defaultCenter || { lat: 28.4595, lng: 77.0266 },
            zoom: defaultZoom || 12,
            mapId: mapId || "bf51a910020fa25a",
            disableDefaultUI: true,
            gestureHandling: 'cooperative',
            ...options,
        });

        setMap(mapInstance);

        return () => {
            // Cleanup markers/listeners if needed
        };
    }, []);

    // Pass map instance to children (markers)
    const childrenWithProps = Children.map(children, child => {
        if (isValidElement(child)) {
            return cloneElement(child, { map } as any);
        }
        return child;
    });

    return (
        <div ref={ref} className={className || "w-full h-full"}>
            {map && childrenWithProps}
        </div>
    );
}
