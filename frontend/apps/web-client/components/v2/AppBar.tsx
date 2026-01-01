/**
 * AppBar Component - V2 Design
 * Top navigation bar with location and notifications
 */

import React from 'react';
import Link from 'next/link';
import { designTokensV2 } from '@/theme/design-tokens-v2';

export interface AppBarProps {
    title?: string;
    showBack?: boolean;
    className?: string;
}

export function AppBar({ title = 'lokals', showBack = false, className = '' }: AppBarProps) {
    return (
        <header
            className={className}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '60px',
                backgroundColor: '#F0F0F0',
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: `0 ${designTokensV2.spacing.lg}`,
                backdropFilter: 'blur(10px)',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {showBack ? (
                    <Link href="/" style={{ fontSize: '24px', textDecoration: 'none', color: '#0E121A' }}>
                        ←
                    </Link>
                ) : (
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        }}
                    >
                        👤
                    </div>
                )}
            </div>

            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
                <h1
                    style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#0E121A',
                        margin: 0,
                    }}
                >
                    {title}
                </h1>
                {!showBack && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '-2px' }}>
                        Narnaund 📍
                    </div>
                )}
            </div>

            <div
                style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                }}
            >
                🔔
            </div>
        </header>
    );
}
