import React from 'react';
import { designTokensV2 } from '@/theme/design-tokens-v2';

export interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({
    width = '100%',
    height = '20px',
    borderRadius,
    className = '',
    variant = 'rectangular',
}: SkeletonProps) {
    const getBorderRadius = () => {
        if (borderRadius) return borderRadius;
        switch (variant) {
            case 'circular': return designTokensV2.radius.full;
            case 'text': return designTokensV2.radius.sm;
            case 'rectangular': default: return designTokensV2.radius.card;
        }
    };

    return (
        <div
            className={`skeleton-loader ${className}`}
            style={{
                width,
                height,
                borderRadius: getBorderRadius(),
                backgroundColor: '#EEEEEE',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <style jsx>{`
        .skeleton-loader::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          transform: translateX(-100%);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.5),
            transparent
          );
          animation: skeleton-shimmer 1.5s infinite;
        }

        @keyframes skeleton-shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
        </div>
    );
}
