/**
 * ProviderBlindBadge Component - v2 Design System
 * "Best provider assigned instantly" badge
 */

import React from 'react';
import { designTokensV2 } from '../../theme/design-tokens-v2';

export interface ProviderBlindBadgeProps {
    variant?: 'default' | 'compact';
    className?: string;
}

export function ProviderBlindBadge({
    variant = 'default',
    className = '',
}: ProviderBlindBadgeProps) {
    return (
        <div
            className={`provider-blind-badge-v2 ${className}`}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: designTokensV2.spacing.sm,
                padding:
                    variant === 'compact'
                        ? `${designTokensV2.spacing.xs} ${designTokensV2.spacing.md}`
                        : `${designTokensV2.spacing.md} ${designTokensV2.spacing.xl}`,
                borderRadius: designTokensV2.radius.pill,
                background: 'rgba(138, 233, 141, 0.1)',
                border: `1px solid ${designTokensV2.colors.accent.success}`,
            }}
        >
            {/* Icon */}
            <span
                style={{
                    fontSize: variant === 'compact' ? '16px' : '20px',
                }}
            >
                ⚡
            </span>

            {/* Text */}
            <span
                style={{
                    fontSize:
                        variant === 'compact'
                            ? designTokensV2.typography.caption.fontSize
                            : designTokensV2.typography.label.fontSize,
                    fontWeight: designTokensV2.typography.label.fontWeight,
                    color: designTokensV2.colors.accent.success,
                }}
            >
                {variant === 'compact' ? 'Auto-assigned' : 'Best provider assigned instantly'}
            </span>

            <style jsx>{`
        .provider-blind-badge-v2 {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
        </div>
    );
}
