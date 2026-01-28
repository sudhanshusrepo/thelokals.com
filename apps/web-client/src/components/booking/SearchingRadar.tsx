import React from 'react';
import { MapPin, X } from 'lucide-react';

interface SearchingRadarProps {
    onCancel: () => void;
    serviceName: string;
}

export const SearchingRadar: React.FC<SearchingRadarProps> = ({ onCancel, serviceName }) => {
    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm animate-in fade-in duration-300">
            {/* Cancel Button */}
            <button
                onClick={onCancel}
                className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200"
            >
                <X size={24} className="text-gray-600" />
            </button>

            {/* Radar Animation Container */}
            <div className="relative flex items-center justify-center w-64 h-64 mb-8">
                {/* Ripple Circles */}
                <div className="absolute w-full h-full bg-primary/10 rounded-full animate-ping opacity-75" />
                <div className="absolute w-48 h-48 bg-primary/20 rounded-full animate-ping opacity-75 delay-150" />
                <div className="absolute w-32 h-32 bg-primary/30 rounded-full animate-pulse" />

                {/* Center Icon */}
                <div className="absolute z-10 w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                    <MapPin className="text-white" size={32} />
                </div>
            </div>

            {/* Status Text */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Searching for Providers</h2>
            <p className="text-gray-500 text-center max-w-xs px-4">
                We are sending your request to nearby {serviceName} experts...
            </p>

            {/* Timer or Progress (Optional) */}
            <div className="mt-8 flex gap-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
        </div>
    );
};
