/**
 * FloatingCta Component - v2 Design System
 * 56px circular CTA button (#FC574E)
 */

import React from 'react';
import { designTokensV2 } from '@/theme/design-tokens-v2';

export interface FloatingCtaProps {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    position?: 'bottom-right' | 'bottom-center' | 'bottom-left';
    className?: string;
}

export function FloatingCta({
    label,
    onClick,
    icon,
    position = 'bottom-right',
    className = '',
}: FloatingCtaProps) {
    const positionStyles = getPositionStyles(position);

    return (
        <button
            onClick={onClick}
            className={`floating-cta-v2 ${className}`}
            aria-label={label}
            style={{
                position: 'fixed',
                ...positionStyles,
                width: designTokensV2.dimensions.floatingCta.size,
                height: designTokensV2.dimensions.floatingCta.size,
                borderRadius: designTokensV2.radius.full,
                background: designTokensV2.colors.accent.danger,
                color: '#FFFFFF',
                border: 'none',
                boxShadow: designTokensV2.shadows.floating,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                transition: `all ${designTokensV2.animation.normal} ${designTokensV2.animation.easing.standard}`,
                zIndex: 1000,
            }}
        >
            {icon || '➕'}

            {/* Tooltip */}
            <span
                className="floating-cta-tooltip"
                style={{
                    position: 'absolute',
                    bottom: '100%',
                    marginBottom: designTokensV2.spacing.xs,
                    padding: `${designTokensV2.spacing.xs} ${designTokensV2.spacing.md}`,
                    borderRadius: designTokensV2.radius.btn,
                    background: designTokensV2.colors.text.primary,
                    color: '#FFFFFF',
                    fontSize: designTokensV2.typography.caption.fontSize,
                    fontWeight: designTokensV2.typography.label.fontWeight,
                    whiteSpace: 'nowrap',
                    opacity: 0,
                    pointerEvents: 'none',
                    transition: `opacity ${designTokensV2.animation.fast} ${designTokensV2.animation.easing.standard}`,
                }}
            >
                {label}
            </span>

            <style jsx>{`
        .floating-cta-v2:hover {
          transform: scale(1.1);
          box-shadow: 0 16px 48px rgba(252, 87, 78, 0.3);
        }

        .floating-cta-v2:active {
          transform: scale(0.95);
        }

        .floating-cta-v2:hover .floating-cta-tooltip {
          opacity: 1;
        }

        /* Pulse animation */
        .floating-cta-v2::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: ${designTokensV2.radius.full};
          background: ${designTokensV2.colors.accent.danger};
          opacity: 0.5;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
      `}</style>
        </button>
    );
}

function getPositionStyles(position: FloatingCtaProps['position']) {
    const offset = designTokensV2.spacing.xl;

    switch (position) {
        case 'bottom-right':
            return {
                bottom: offset,
                right: offset,
            };
        case 'bottom-center':
            return {
                bottom: offset,
                left: '50%',
                transform: 'translateX(-50%)',
            };
        case 'bottom-left':
            return {
                bottom: offset,
                left: offset,
            };
        default:
            return {
                bottom: offset,
                right: offset,
            };
    }
}
