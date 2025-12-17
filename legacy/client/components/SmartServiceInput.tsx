import React, { useState, useRef, useEffect } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useVideoRecorder } from '../hooks/useVideoRecorder';
import { useNavigate } from 'react-router-dom';

interface SmartServiceInputProps {
    onSend: (content: { type: 'text' | 'audio' | 'video', data: string | Blob }) => void;
    isLoading?: boolean;
    placeholder?: string;
    serviceCategory?: string; // Optional context to show label
}

export const SmartServiceInput: React.FC<SmartServiceInputProps> = ({
    onSend,
    isLoading = false,
    placeholder = "Describe your issue...",
    serviceCategory
}) => {
    const [text, setText] = useState('');
    const [mode, setMode] = useState<'text' | 'audio' | 'video'>('text');
    const [isSticky, setIsSticky] = useState(false);

    const audioRecorder = useAudioRecorder();
    const videoRecorder = useVideoRecorder();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Sticky behavior logic
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            // Provide a small threshold before sticking to bottom
            setIsSticky(scrollY > 100);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [text]);

    const handleSendText = () => {
        if (text.trim()) {
            onSend({ type: 'text', data: text });
            setText('');
            if (textareaRef.current) textareaRef.current.style.height = 'auto';
        }
    };

    const handleSendAudio = () => {
        if (audioRecorder.audioBlob) {
            onSend({ type: 'audio', data: audioRecorder.audioBlob });
            audioRecorder.resetRecording();
            setMode('text');
        }
    };

    const handleSendVideo = () => {
        if (videoRecorder.videoBlob) {
            onSend({ type: 'video', data: videoRecorder.videoBlob });
            videoRecorder.resetRecording();
            setMode('text');
        }
    };

    // Helper to request permissions
    const requestMediaAccess = async (type: 'audio' | 'video') => {
        try {
            const constraints = type === 'audio' ? { audio: true } : { audio: true, video: true };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            stream.getTracks().forEach(t => t.stop()); // Stop test stream

            setMode(type);
            if (type === 'audio') audioRecorder.startRecording();
            else videoRecorder.startRecording();
        } catch (err) {
            console.error(`${type} permission denied:`, err);
            alert(`Please allow ${type} access to use this feature.`);
        }
    };

    // Render Audio/Video Modes (Overlay style)
    if (mode === 'audio' || mode === 'video') {
        const isAudio = mode === 'audio';
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-fade-in">
                <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl relative">
                    {/* Close Button */}
                    <button
                        onClick={() => {
                            isAudio ? audioRecorder.stopRecording() : videoRecorder.stopRecording();
                            setMode('text');
                        }}
                        className="absolute top-4 right-4 text-slate-400 hover:text-white"
                    >
                        ✕
                    </button>

                    <h3 className="text-center font-bold text-lg mb-6 dark:text-white">
                        {isAudio ? 'Recording Audio' : 'Recording Video'}
                    </h3>

                    {/* Preview Area */}
                    <div className="bg-black rounded-2xl aspect-video mb-6 flex items-center justify-center overflow-hidden relative">
                        {isAudio ? (
                            <div className="flex gap-1 items-end h-12">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="w-2 bg-teal-500 animate-pulse rounded-full" style={{ height: `${Math.random() * 100}%` }} />
                                ))}
                            </div>
                        ) : (
                            <video
                                ref={videoRecorder.videoRef}
                                className="w-full h-full object-cover"
                                autoPlay
                                muted={videoRecorder.isRecording}
                                playsInline
                            />
                        )}

                        {/* Timer Overlay */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-500/80 text-white px-3 py-1 rounded-full text-xs font-mono">
                            {isAudio
                                ? formatTime(audioRecorder.recordingTime)
                                : formatTime(videoRecorder.recordingTime)
                            }
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex justify-center gap-6">
                        <button
                            onClick={() => isAudio ? audioRecorder.stopRecording() : videoRecorder.stopRecording()}
                            className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105"
                        >
                            <div className="w-6 h-6 bg-white rounded-sm" />
                        </button>

                        {/* Send Button only if we have blob */}
                        {(audioRecorder.audioUrl || videoRecorder.videoUrl) && !((isAudio ? audioRecorder.isRecording : videoRecorder.isRecording)) && (
                            <button
                                onClick={isAudio ? handleSendAudio : handleSendVideo}
                                className="w-16 h-16 bg-teal-500 hover:bg-teal-600 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce-small"
                            >
                                ➤
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Default Text Input UI
    // Position logic: If sticky, fixed bottom. If not, relative (or handled by parent layout, but usually we want it to sit naturally then stick).
    // Actually, `StickyChatCta` logic was "if scrolled past X, show fixed".
    // ServiceRequestPage usually puts the input at the bottom of the content anyway.
    // Let's implement the localized styling.

    const containerClasses = isSticky
        ? "fixed bottom-4 left-4 right-4 z-40 animate-slide-up"
        : "relative w-full"; // Default flow

    return (
        <div className={containerClasses}>
            <div className={`
                max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-2 sm:p-3
                flex items-end gap-2 transition-all duration-300
                ${isSticky ? 'shadow-2xl ring-1 ring-slate-900/5' : ''}
            `}>
                {/* Media Buttons */}
                <div className="flex gap-1 pb-1.5 pl-1">
                    <button
                        onClick={() => requestMediaAccess('audio')}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                        title="Record Audio"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    </button>
                    <button
                        onClick={() => requestMediaAccess('video')}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                        title="Record Video"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                </div>

                {/* Text Area */}
                <div className="flex-1 relative min-w-0">
                    {serviceCategory && isSticky && (
                        <div className="absolute -top-7 left-0 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white dark:bg-slate-800 px-2 rounded-t-md border-t border-x border-slate-100 dark:border-slate-700">
                            Context: {serviceCategory}
                        </div>
                    )}
                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendText();
                            }
                        }}
                        placeholder={placeholder}
                        disabled={isLoading}
                        data-testid="smart-service-input-textarea"
                        rows={1}
                        className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 resize-none focus:outline-none py-2.5 max-h-32 min-h-[44px]"
                    />
                </div>

                {/* Send Button */}
                <button
                    onClick={handleSendText}
                    disabled={!text.trim() || isLoading}
                    data-testid="chat-send-button"
                    className={`
                        p-3 rounded-xl transition-all duration-200 mb-0.5
                        ${text.trim() && !isLoading
                            ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-md active:scale-95'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-500 cursor-not-allowed'
                        }
                    `}
                >
                    {isLoading ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                        <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    )}
                </button>
            </div>
        </div>
    );
};

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
