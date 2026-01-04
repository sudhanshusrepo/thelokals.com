import React from 'react';
import { User, Bot } from 'lucide-react';
import { designTokensV2 } from '../../theme/design-tokens-v2';

interface MessageBubbleProps {
    role: 'user' | 'assistant';
    content: string;
}

export const MessageBubble = ({ role, content }: MessageBubbleProps) => {
    const isUser = role === 'user';

    return (
        <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`
                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${isUser ? 'bg-neutral-200' : 'bg-primary text-white'}
            `}>
                {isUser ? <User size={16} className="text-neutral-600" /> : <Bot size={16} />}
            </div>

            <div className={`
                max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm
                ${isUser
                    ? 'bg-primary text-white rounded-tr-none'
                    : 'bg-white text-neutral-800 border border-neutral-100 rounded-tl-none'}
            `}>
                {/* Basic rendering. Markdown support can be added later if needed */}
                <p className="whitespace-pre-wrap">{content}</p>
            </div>
        </div>
    );
};
