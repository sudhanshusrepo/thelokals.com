/**
 * HeroCard Component - v2 Design System
 * 420x240px gradient card with CTA buttons
 */

import React from 'react';
import { designTokensV2 } from '@/theme/design-tokens-v2';

export interface HeroCardProps {
    title: string;
    subtitle: string;
    cta1?: {
        label: string;
        onClick: () => void;
        variant?: 'primary' | 'secondary';
    };
    cta2?: {
        label: string;
        onClick: () => void;
        variant?: 'primary' | 'secondary';
    };
    image?: string;
    variant?: 'gradient' | 'dark' | 'light';
    className?: string;
}

export function HeroCard({
    title,
    subtitle,
    cta1,
    cta2,
    image,
    variant = 'gradient',
    className = '',
}: HeroCardProps) {
    const backgroundStyle = getBackgroundStyle(variant);

    return (
        <div
            className={`hero-card-v2 ${className}`}
            style={{
                position: 'relative',
                width: '100%',
                maxWidth: designTokensV2.dimensions.heroCard.width,
                height: designTokensV2.dimensions.heroCard.height,
                borderRadius: designTokensV2.radius.hero,
                overflow: 'hidden',
                boxShadow: designTokensV2.shadows.card,
                ...backgroundStyle,
            }}
        >
            {/* Background Image (if provided) */}
            {image && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url(${image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.3,
                    }}
                />
            )}

            {/* Content Container */}
            <div
                style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: designTokensV2.spacing['2xl'],
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}
            >
                {/* Text Content */}
                <div>
                    <h2
                        style={{
                            fontSize: designTokensV2.typography.h1.fontSize,
                            fontWeight: designTokensV2.typography.h1.fontWeight,
                            lineHeight: designTokensV2.typography.h1.lineHeight,
                            color: variant === 'dark' ? '#FFFFFF' : designTokensV2.typography.h1.color,
                            marginBottom: designTokensV2.spacing.sm,
                        }}
                    >
                        {title}
                    </h2>
                    <p
                        style={{
                            fontSize: designTokensV2.typography.bodyLg.fontSize,
                            fontWeight: designTokensV2.typography.bodyLg.fontWeight,
                            lineHeight: designTokensV2.typography.bodyLg.lineHeight,
                            color: variant === 'dark' ? 'rgba(255, 255, 255, 0.87)' : designTokensV2.typography.bodyLg.color,
                        }}
                    >
                        {subtitle}
                    </p>
                </div>

                {/* CTA Buttons */}
                {(cta1 || cta2) && (
                    <div
                        style={{
                            display: 'flex',
                            gap: designTokensV2.spacing.md,
                            flexWrap: 'wrap',
                        }}
                    >
                        {cta1 && (
                            <button
                                onClick={cta1.onClick}
                                className="hero-card-cta"
                                style={{
                                    padding: `${designTokensV2.spacing.sm} ${designTokensV2.spacing.xl}`,
                                    borderRadius: designTokensV2.radius.btn,
                                    fontSize: designTokensV2.typography.label.fontSize,
                                    fontWeight: designTokensV2.typography.label.fontWeight,
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: `all ${designTokensV2.animation.normal} ${designTokensV2.animation.easing.standard}`,
                                    ...(cta1.variant === 'secondary'
                                        ? {
                                            background: 'rgba(255, 255, 255, 0.2)',
                                            color: variant === 'dark' ? '#FFFFFF' : designTokensV2.colors.text.primary,
                                            backdropFilter: 'blur(10px)',
                                        }
                                        : {
                                            background: designTokensV2.colors.accent.danger,
                                            color: '#FFFFFF',
                                        }),
                                }}
                            >
                                {cta1.label}
                            </button>
                        )}
                        {cta2 && (
                            <button
                                onClick={cta2.onClick}
                                className="hero-card-cta"
                                style={{
                                    padding: `${designTokensV2.spacing.sm} ${designTokensV2.spacing.xl}`,
                                    borderRadius: designTokensV2.radius.btn,
                                    fontSize: designTokensV2.typography.label.fontSize,
                                    fontWeight: designTokensV2.typography.label.fontWeight,
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: `all ${designTokensV2.animation.normal} ${designTokensV2.animation.easing.standard}`,
                                    ...(cta2.variant === 'secondary'
                                        ? {
                                            background: 'rgba(255, 255, 255, 0.2)',
                                            color: variant === 'dark' ? '#FFFFFF' : designTokensV2.colors.text.primary,
                                            backdropFilter: 'blur(10px)',
                                        }
                                        : {
                                            background: designTokensV2.colors.accent.danger,
                                            color: '#FFFFFF',
                                        }),
                                }}
                            >
                                {cta2.label}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Shimmer animation overlay */}
            <style jsx>{`
        .hero-card-v2::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }

        .hero-card-cta:hover {
          transform: scale(1.05);
          box-shadow: ${designTokensV2.shadows.elevated};
        }

        .hero-card-cta:active {
          transform: scale(0.98);
        }
      `}</style>
        </div>
    );
}

function getBackgroundStyle(variant: 'gradient' | 'dark' | 'light') {
    switch (variant) {
        case 'gradient':
            return {
                background: designTokensV2.colors.gradient.css,
            };
        case 'dark':
            return {
                background: designTokensV2.colors.text.primary,
            };
        case 'light':
            return {
                background: designTokensV2.colors.background.surface,
            };
        default:
            return {
                background: designTokensV2.colors.gradient.css,
            };
    }
}
