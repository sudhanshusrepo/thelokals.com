import React from 'react';
import { WifiOff } from 'lucide-react';

interface MapErrorProps {
    message?: string;
    className?: string;
    style?: React.CSSProperties;
    onRetry?: () => void;
}

export const MapError: React.FC<MapErrorProps> = ({ message, className, style, onRetry }) => {
    return (
        <div
            className={`flex flex-col items-center justify-center bg-neutral-50 rounded-xl p-6 text-center border border-neutral-200 ${className}`}
            style={style}
        >
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-3">
                <WifiOff size={24} />
            </div>
            <h3 className="font-medium text-neutral-900 mb-1">Map Unavailable</h3>
            <p className="text-sm text-neutral-500 mb-4 max-w-[200px]">
                {message || 'We couldn\'t load the map. Please check your connection.'}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="text-xs font-semibold text-neutral-900 bg-white border border-neutral-200 px-3 py-1.5 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                    Try Again
                </button>
            )}
        </div>
    );
};
