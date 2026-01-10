import React from 'react';

interface MapSkeletonProps {
    className?: string;
    style?: React.CSSProperties;
}

export const MapSkeleton: React.FC<MapSkeletonProps> = ({ className, style }) => {
    return (
        <div
            className={`animate-pulse bg-neutral-100 rounded-xl relative overflow-hidden border border-neutral-200 ${className}`}
            style={style}
        >
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
                {/* Simple grid pattern */}
                <div className="w-full h-full" style={{
                    backgroundImage: 'radial-gradient(#999 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}></div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-neutral-200 border-t-neutral-400 rounded-full animate-spin"></div>
            </div>
        </div>
    );
};
