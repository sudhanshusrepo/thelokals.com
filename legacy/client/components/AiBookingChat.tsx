import React, { useState, useEffect } from 'react';
import { ChatInput } from './ChatInput';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { chatWithAI } from '@thelocals/core/services/geminiService';

interface AiBookingChatProps {
    isOpen: boolean;
    onClose: () => void;
    initialContext?: any;
}

export const AiBookingChat: React.FC<AiBookingChatProps> = ({ isOpen, onClose, initialContext }) => {
    const { user } = useAuth();
    const location = useLocation();
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Reset or initialize chat
            setMessages([
                { role: 'assistant', content: "Hi! I'm your AI booking assistant. How can I help you today?" }
            ]);
        }
    }, [isOpen]);

    const handleSend = async (content: { type: 'text' | 'audio' | 'video', data: string | Blob }) => {
        const text = content.type === 'text' ? content.data as string : "Media received";

        setMessages(prev => [...prev, { role: 'user', content: text }]);
        setIsLoading(true);

        try {
            const response = await chatWithAI(text, messages);
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 w-full h-full sm:h-[90vh] sm:w-[90vw] sm:max-w-4xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
                {/* Header */}
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-900 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Booking Assistant</h2>
                        <p className="text-sm text-slate-500">Powered by Gemini</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user'
                                ? 'bg-teal-600 text-white rounded-tr-none'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="absolute bottom-0 left-0 right-0">
                    <ChatInput onSend={handleSend} isLoading={isLoading} />
                </div>
            </div>
        </div>
    );
};
