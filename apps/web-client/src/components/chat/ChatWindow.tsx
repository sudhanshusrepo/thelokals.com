import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { BookingProposalCard } from './BookingProposalCard';
import { useAIConversation } from '../../hooks/useAIConversation';

interface ChatWindowProps {
    onClose: () => void;
    isOpen: boolean;
}

export const ChatWindow = ({ onClose, isOpen }: ChatWindowProps) => {
    const router = useRouter();
    const { messages, isTyping, sendMessage, clearChat } = useAIConversation();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, isOpen]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        sendMessage(inputValue);
        setInputValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleBookNow = (serviceName?: string) => {
        // Navigate to booking flow, passing service name as query param
        const params = new URLSearchParams();
        if (serviceName) params.set('service', serviceName);
        router.push(`/services?${params.toString()}`);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-neutral-200 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 z-50">
            {/* Header */}
            <div className="px-4 py-3 bg-primary text-white flex justify-between items-center shadow-md">
                <div className="flex items-center gap-2">
                    <div className="bg-white/20 p-1.5 rounded-full">
                        <Bot size={18} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Booking Assistant</h3>
                        <p className="text-xs text-blue-100 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={clearChat} className="p-1 hover:bg-white/20 rounded-full transition-colors" title="Clear Chat">
                        <Trash2 size={16} />
                    </button>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-neutral-50/50">
                {messages.map(msg => (
                    <React.Fragment key={msg.id}>
                        {msg.type === 'booking_proposal' ? (
                            <BookingProposalCard
                                serviceName={msg.metadata?.serviceName || 'Service'}
                                estimatedCost={msg.metadata?.estimatedCost || 'TBD'}
                                onBook={() => handleBookNow(msg.metadata?.serviceName)}
                            />
                        ) : (
                            <MessageBubble role={msg.role} content={msg.content} />
                        )}
                    </React.Fragment>
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-neutral-100">
                <div className="flex gap-2 items-end bg-neutral-50 border border-neutral-200 rounded-2xl px-3 py-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your request..."
                        className="flex-1 bg-transparent border-none outline-none resize-none text-sm max-h-24 py-2"
                        rows={1}
                        style={{ minHeight: '40px' }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                        className="p-2 bg-primary text-white rounded-xl hover:bg-primary-hover disabled:bg-neutral-300 disabled:cursor-not-allowed transition-all mb-0.5"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
