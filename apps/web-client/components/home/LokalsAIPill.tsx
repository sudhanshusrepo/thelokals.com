'use client';

import React from 'react';

interface LokalsAIPillProps {
    state?: 'idle' | 'listening' | 'searching';
    className?: string;
}

/**
 * Lokals AI Pill Component
 * 
 * Displays an animated AI status indicator with three states:
 * - idle: Static text with subtle pulsing dot (10-12s interval)
 * - listening: Glow effect with animated waveform
 * - searching: Similar to listening with processing indicator
 */
export function LokalsAIPill({ state = 'idle', className = '' }: LokalsAIPillProps) {
    return (
        <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-primary text-white text-xs font-bold shadow-sm ${className}`}
            role="status"
            aria-label={`Lokals AI ${state}`}
        >
            {/* AI Glyph Icon (two dots + line) */}
            <div className="relative flex items-center gap-0.5">
                <div className={`w-1 h-1 rounded-full bg-primary ${state !== 'idle' ? 'animate-pulse' : ''}`} />
                <div className="w-2 h-px bg-primary/60" />
                <div className={`w-1 h-1 rounded-full bg-primary ${state !== 'idle' ? 'animate-pulse' : ''}`}
                    style={{ animationDelay: '0.15s' }} />
            </div>

            {/* Text */}
            <span>Lokals AI</span>

            {/* Status Dot - Pulses slowly on idle, faster when active */}
            <div className="relative flex items-center justify-center w-2 h-2">
                <div
                    className={`absolute w-2 h-2 rounded-full bg-primary ${state === 'idle' ? 'animate-pulse-slow' : 'animate-pulse'
                        }`}
                />
                {state !== 'idle' && (
                    <div className="absolute w-3 h-3 rounded-full bg-primary/30 animate-ping" />
                )}
            </div>
        </div>
    );
}
