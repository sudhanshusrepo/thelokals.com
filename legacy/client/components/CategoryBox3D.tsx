import React from 'react';

interface CategoryBox3DProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * A 3D box container with light-green theme and subtle shadow effects.
 * Used to wrap category grids with a premium, modern look.
 */
export const CategoryBox3D: React.FC<CategoryBox3DProps> = ({ children, className = '' }) => {
    return (
        <div
            className={`
        relative
        bg-gradient-to-br from-green-50 to-emerald-50
        dark:from-green-900/20 dark:to-emerald-900/20
        rounded-3xl
        p-6 sm:p-8
        shadow-[0_8px_30px_rgb(34,197,94,0.12)]
        dark:shadow-[0_8px_30px_rgb(34,197,94,0.08)]
        border border-green-100/50
        dark:border-green-800/30
        backdrop-blur-sm
        transform-gpu
        transition-all duration-300
        hover:shadow-[0_12px_40px_rgb(34,197,94,0.18)]
        dark:hover:shadow-[0_12px_40px_rgb(34,197,94,0.12)]
        ${className}
      `}
            style={{
                transform: 'perspective(1000px) rotateX(0.5deg)',
            }}
        >
            {/* Top highlight for 3D effect */}
            <div
                className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-green-200/50 to-transparent rounded-t-3xl"
                aria-hidden="true"
            />

            {/* Left edge highlight */}
            <div
                className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-transparent via-green-200/30 to-transparent rounded-l-3xl"
                aria-hidden="true"
            />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>

            {/* Bottom shadow for depth */}
            <div
                className="absolute inset-x-4 -bottom-2 h-4 bg-green-200/20 dark:bg-green-900/10 blur-xl rounded-full"
                aria-hidden="true"
            />
        </div>
    );
};
