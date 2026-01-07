'use client';

import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { ChatWindow } from './ChatWindow';

export const AIChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />

            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center z-50 animate-in fade-in zoom-in duration-300"
                >
                    <MessageCircle size={28} />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
            )}
        </>
    );
};
