import { useState, useCallback } from 'react';
import { chatWithAI } from '@thelocals/platform-core';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    type?: 'text' | 'booking_proposal';
    content: string;
    metadata?: {
        serviceName?: string;
        estimatedCost?: string;
    };
    timestamp: number;
}

export const useAIConversation = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'init',
            role: 'assistant',
            type: 'text',
            content: 'Hi! I can help you find services, estimate costs, or verify availability. What do you need today?',
            timestamp: Date.now()
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim()) return;

        // Add user message immediately
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            type: 'text',
            content,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        try {
            // Prepare history for API
            const history = messages.filter(m => m.type === 'text').map(m => ({
                role: m.role,
                parts: [{ text: m.content }]
            }));

            // Call API
            const responseText = await chatWithAI(content, history);

            // Mock Logic: Detect intent to book
            const lowerContent = content.toLowerCase();
            const lowerResponse = responseText.toLowerCase();

            // Heuristic: If AI says "I can book" or user says "book plmuber", show proposal
            const showProposal = lowerResponse.includes("i can book") || lowerContent.includes("book") || lowerContent.includes("schedule");

            // Add bot response
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                type: 'text',
                content: responseText,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, botMsg]);

            if (showProposal) {
                // Determine service from context or fallback
                const serviceName = lowerContent.includes("plumber") ? "Plumbing Service" : "General Service";

                setTimeout(() => {
                    const proposalMsg: Message = {
                        id: (Date.now() + 2).toString(),
                        role: 'assistant',
                        type: 'booking_proposal',
                        content: 'Booking Proposal',
                        metadata: {
                            serviceName: serviceName,
                            estimatedCost: '₹500 - ₹800'
                        },
                        timestamp: Date.now()
                    };
                    setMessages(prev => [...prev, proposalMsg]);
                }, 500);
            }

        } catch (error) {
            console.error('Chat error:', error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                type: 'text',
                content: "I'm sorry, I'm having trouble connecting right now. Please try again.",
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    }, [messages]);

    const clearChat = useCallback(() => {
        setMessages([
            {
                id: 'init',
                role: 'assistant',
                content: 'Hi! I can help you find services, estimate costs, or verify availability. What do you need today?',
                timestamp: Date.now()
            }
        ]);
    }, []);

    return {
        messages,
        isTyping,
        sendMessage,
        clearChat
    };
};
