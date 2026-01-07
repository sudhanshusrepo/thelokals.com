'use client';

import dynamic from 'next/dynamic';

const AIChatWidget = dynamic(() => import('./AIChatWidget').then(mod => mod.AIChatWidget), {
    ssr: false,
    loading: () => null
});

export function AIChatWrapper() {
    return <AIChatWidget />;
}
