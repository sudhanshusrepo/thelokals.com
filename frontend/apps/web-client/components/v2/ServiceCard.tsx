/**
 * ServiceCard Component - v2 Design System
 * 160x220px service tile (provider-blind)
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { designTokensV2 } from '@/theme/design-tokens-v2';

export interface ServiceCardProps {
    service: {
        id: string;
        name: string;
        image: string;
        price: number;
        rating: number;
        reviews: number;
        isBestMatch?: boolean;
    };
    onClick: (id: string) => void;
    className?: string;
}

export function ServiceCard({ service, onClick, className = '' }: ServiceCardProps) {
    return (
        <motion.div
            className={`service-card-v2 ${className}`}
            onClick={() => onClick(service.id)}
            whileHover={{ y: -4, boxShadow: designTokensV2.shadows.elevated }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            style={{
                width: '100%',
                maxWidth: designTokensV2.dimensions.serviceCard.width,
                height: designTokensV2.dimensions.serviceCard.height,
                borderRadius: designTokensV2.radius.card,
                overflow: 'hidden',
                boxShadow: designTokensV2.shadows.card,
                background: designTokensV2.colors.background.surface,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Service Image */}
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '120px',
                    overflow: 'hidden',
                }}
            >
                <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="160px"
                />

                {/* Best Match Badge */}
                {service.isBestMatch && (
                    <div
                        style={{
                            position: 'absolute',
                            top: designTokensV2.spacing.xs,
                            right: designTokensV2.spacing.xs,
                            padding: `${designTokensV2.spacing.xs} ${designTokensV2.spacing.sm}`,
                            borderRadius: designTokensV2.radius.pill,
                            background: designTokensV2.colors.gradient.end,
                            fontSize: designTokensV2.typography.caption.fontSize,
                            fontWeight: designTokensV2.typography.label.fontWeight,
                            color: designTokensV2.colors.text.primary,
                        }}
                    >
                        best match
                    </div>
                )}
            </div>

            {/* Service Info */}
            <div
                style={{
                    padding: designTokensV2.spacing.md,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: designTokensV2.spacing.xs,
                    flex: 1,
                }}
            >
                {/* Service Name */}
                <h3
                    style={{
                        fontSize: designTokensV2.typography.body.fontSize,
                        fontWeight: designTokensV2.typography.label.fontWeight,
                        lineHeight: designTokensV2.typography.body.lineHeight,
                        color: designTokensV2.colors.text.primary,
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                    }}
                >
                    {service.name}
                </h3>

                {/* Price */}
                <div
                    style={{
                        fontSize: designTokensV2.typography.bodyLg.fontSize,
                        fontWeight: designTokensV2.typography.h2.fontWeight,
                        color: designTokensV2.colors.text.primary,
                        marginTop: 'auto',
                    }}
                >
                    ₹{service.price}
                </div>

                {/* Rating & Reviews */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: designTokensV2.spacing.xs,
                        fontSize: designTokensV2.typography.caption.fontSize,
                        color: designTokensV2.colors.text.tertiary,
                    }}
                >
                    <span style={{ color: designTokensV2.colors.gradient.start }}>★</span>
                    <span style={{ fontWeight: 500 }}>{service.rating}</span>
                    <span>({service.reviews})</span>
                </div>
            </div>
        </motion.div>
    );
}
