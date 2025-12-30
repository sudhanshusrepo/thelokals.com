/**
 * StatusCard Component - v2 Design System
 * 360x120px booking status display
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { designTokensV2 } from '@/theme/design-tokens-v2';

export interface StatusCardProps {
    status: 'requested' | 'assigned' | 'on-the-way' | 'in-progress' | 'completed' | 'cancelled';
    serviceName: string;
    bookingDate: string;
    bookingTime?: string;
    providerName?: string;
    estimatedArrival?: string;
    className?: string;
}

export function StatusCard({
    status,
    serviceName,
    bookingDate,
    bookingTime,
    providerName,
    estimatedArrival,
    className = '',
}: StatusCardProps) {
    const statusConfig = getStatusConfig(status);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`status-card-v2 ${className}`}
            style={{
                width: '100%',
                maxWidth: designTokensV2.dimensions.statusCard.width,
                minHeight: designTokensV2.dimensions.statusCard.height,
                borderRadius: designTokensV2.radius.card,
                padding: designTokensV2.spacing.xl,
                background: designTokensV2.colors.background.surface,
                boxShadow: designTokensV2.shadows.card,
                display: 'flex',
                flexDirection: 'column',
                gap: designTokensV2.spacing.md,
            }}
        >
            {/* Status Badge */}
            <div
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: designTokensV2.spacing.xs,
                    alignSelf: 'flex-start',
                    padding: `${designTokensV2.spacing.xs} ${designTokensV2.spacing.md}`,
                    borderRadius: designTokensV2.radius.pill,
                    background: statusConfig.background,
                    fontSize: designTokensV2.typography.caption.fontSize,
                    fontWeight: designTokensV2.typography.label.fontWeight,
                    color: statusConfig.color,
                }}
            >
                <span style={{ fontSize: '16px' }}>{statusConfig.icon}</span>
                {statusConfig.label}
            </div>

            {/* Service Name */}
            <h3
                style={{
                    fontSize: designTokensV2.typography.h2.fontSize,
                    fontWeight: designTokensV2.typography.h2.fontWeight,
                    lineHeight: designTokensV2.typography.h2.lineHeight,
                    color: designTokensV2.colors.text.primary,
                    margin: 0,
                }}
            >
                {serviceName}
            </h3>

            {/* Booking Details */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: designTokensV2.spacing.xs,
                }}
            >
                <div
                    style={{
                        fontSize: designTokensV2.typography.body.fontSize,
                        color: designTokensV2.colors.text.secondary,
                    }}
                >
                    📅 {bookingDate}
                    {bookingTime && ` • ${bookingTime}`}
                </div>

                {providerName && (
                    <div
                        style={{
                            fontSize: designTokensV2.typography.body.fontSize,
                            color: designTokensV2.colors.text.secondary,
                        }}
                    >
                        👤 {providerName}
                    </div>
                )}

                {estimatedArrival && (
                    <div
                        style={{
                            fontSize: designTokensV2.typography.body.fontSize,
                            color: designTokensV2.colors.accent.success,
                            fontWeight: 500,
                        }}
                    >
                        ⏱️ Arrives in {estimatedArrival}
                    </div>
                )}
            </div>

            {/* Progress Bar (for in-progress status) */}
            {status === 'in-progress' && (
                <div
                    style={{
                        width: '100%',
                        height: '4px',
                        borderRadius: designTokensV2.radius.full,
                        background: 'rgba(138, 233, 141, 0.2)',
                        overflow: 'hidden',
                        marginTop: designTokensV2.spacing.xs,
                    }}
                >
                    <motion.div
                        className="progress-bar-fill"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                            height: '100%',
                            background: designTokensV2.colors.accent.success,
                            borderRadius: designTokensV2.radius.full,
                        }}
                    />
                </div>
            )}
        </motion.div>
    );
}

function getStatusConfig(status: StatusCardProps['status']) {
    switch (status) {
        case 'requested':
            return {
                label: 'Requested',
                icon: '🕐',
                background: 'rgba(247, 200, 70, 0.1)',
                color: designTokensV2.colors.accent.warning,
            };
        case 'assigned':
            return {
                label: 'Provider Assigned',
                icon: '✓',
                background: 'rgba(138, 233, 141, 0.1)',
                color: designTokensV2.colors.accent.success,
            };
        case 'on-the-way':
            return {
                label: 'On the Way',
                icon: '🚗',
                background: 'rgba(59, 130, 246, 0.1)',
                color: '#3B82F6',
            };
        case 'in-progress':
            return {
                label: 'In Progress',
                icon: '⚡',
                background: 'rgba(138, 233, 141, 0.1)',
                color: designTokensV2.colors.accent.success,
            };
        case 'completed':
            return {
                label: 'Completed',
                icon: '✓',
                background: 'rgba(138, 233, 141, 0.1)',
                color: designTokensV2.colors.accent.success,
            };
        case 'cancelled':
            return {
                label: 'Cancelled',
                icon: '✕',
                background: 'rgba(252, 87, 78, 0.1)',
                color: designTokensV2.colors.accent.danger,
            };
        default:
            return {
                label: 'Unknown',
                icon: '?',
                background: 'rgba(100, 116, 139, 0.1)',
                color: designTokensV2.colors.text.tertiary,
            };
    }
}
