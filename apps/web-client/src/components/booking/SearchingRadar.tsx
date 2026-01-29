import React from 'react';
import { MapPin, X } from 'lucide-react';

interface SearchingRadarProps {
    onCancel: () => void;
    serviceName: string;
}

export const SearchingRadar: React.FC<SearchingRadarProps> = ({ onCancel, serviceName }) => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/30 backdrop-blur-md animate-in fade-in duration-500">
            {/* Cancel Button */}
            <button
                onClick={onCancel}
                className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all border border-white/20 text-white"
            >
                <X size={24} />
            </button>

            {/* Radar Animation Container */}
            <div className="relative flex items-center justify-center w-80 h-80 mb-12">
                {/* 1. Deep Pulse (Slow) */}
                <div className="absolute w-full h-full bg-lokals-red/10 rounded-full animate-[ping_3s_linear_infinite]" />

                {/* 2. Mid Pulse (Medium) */}
                <div className="absolute w-64 h-64 bg-lokals-red/20 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />

                {/* 3. Core Glow */}
                <div className="absolute w-32 h-32 bg-gradient-to-tr from-lokals-red to-orange-500 rounded-full animate-pulse shadow-[0_0_60px_rgba(239,68,68,0.6)]" />

                {/* Center Icon */}
                <div className="absolute z-10 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl">
                    <MapPin className="text-lokals-red" size={40} strokeWidth={2.5} />
                </div>
            </div>

            {/* Status Text */}
            <h2 className="text-3xl font-black text-white mb-3 tracking-tight text-center">Finding {serviceName}</h2>
            <p className="text-gray-200 text-center max-w-sm px-6 text-lg font-medium opacity-90">
                Broadcasting your request to top-rated nearby experts...
            </p>

            {/* Progress Dots */}
            <div className="mt-10 flex gap-3">
                <div className="w-3 h-3 bg-white rounded-full animate-[bounce_1s_infinite_0ms]" />
                <div className="w-3 h-3 bg-white/80 rounded-full animate-[bounce_1s_infinite_200ms]" />
                <div className="w-3 h-3 bg-white/60 rounded-full animate-[bounce_1s_infinite_400ms]" />
            </div>
        </div>
    );
};
