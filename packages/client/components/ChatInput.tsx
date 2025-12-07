import React, { useState, useEffect, useRef } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useVideoRecorder } from '../hooks/useVideoRecorder';

interface ChatInputProps {
    onSend: (content: { type: 'text' | 'audio' | 'video', data: string | Blob }) => void;
    isLoading?: boolean;
    placeholder?: string;
    className?: string;
    hideMedia?: boolean;
    animate?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading = false, placeholder = "Type or record your request...", className = "", hideMedia = false, animate = true }) => {
    const [text, setText] = useState('');
    const [mode, setMode] = useState<'text' | 'audio' | 'video'>('text');

    const audioRecorder = useAudioRecorder();
    const videoRecorder = useVideoRecorder();

    const textareaRef = useRef<HTMLTextAreaElement>(null);

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
            // Reset height
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

    // Audio Recording UI
    if (mode === 'audio') {
        return (
            <div className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 p-4 border-t dark:border-slate-700 shadow-lg z-50 ${animate ? 'animate-slide-up' : ''} ${className}`}>
                <div className="max-w-3xl mx-auto flex flex-col items-center gap-4">
                    <div className="text-red-500 font-mono text-xl animate-pulse">
                        {formatTime(audioRecorder.recordingTime)} / 01:00
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => {
                                audioRecorder.stopRecording();
                                audioRecorder.resetRecording();
                                setMode('text');
                            }}
                            className="p-3 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        {audioRecorder.isRecording ? (
                            <button
                                onClick={audioRecorder.stopRecording}
                                className="p-6 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-lg transform hover:scale-105 transition-all"
                            >
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" /></svg>
                            </button>
                        ) : (
                            <div className="flex gap-4">
                                <button
                                    onClick={audioRecorder.startRecording}
                                    className="p-4 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                </button>
                                <button
                                    onClick={handleSendAudio}
                                    className="p-4 rounded-full bg-teal-600 text-white hover:bg-teal-700 shadow-lg"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </button>
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-slate-500">
                        {audioRecorder.isRecording ? 'Recording audio...' : 'Review your recording'}
                    </p>
                    {audioRecorder.audioUrl && (
                        <audio src={audioRecorder.audioUrl} controls className="w-full mt-2" />
                    )}
                </div>
            </div>
        );
    }

    // Video Recording UI
    if (mode === 'video') {
        return (
            <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center animate-fade-in">
                <div className="relative w-full max-w-lg aspect-[9/16] bg-black rounded-lg overflow-hidden">
                    <video
                        ref={videoRecorder.videoRef}
                        className="w-full h-full object-cover"
                        muted={videoRecorder.isRecording} // Mute preview to avoid feedback
                        playsInline
                        autoPlay
                    />

                    {/* Overlay Controls */}
                    <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-4">
                        <div className="bg-black/50 px-3 py-1 rounded-full text-white font-mono">
                            {formatTime(videoRecorder.recordingTime)} / 00:30
                        </div>

                        <div className="flex items-center gap-8">
                            <button
                                onClick={() => {
                                    videoRecorder.stopRecording();
                                    videoRecorder.resetRecording();
                                    setMode('text');
                                }}
                                className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>

                            {videoRecorder.isRecording ? (
                                <button
                                    onClick={videoRecorder.stopRecording}
                                    className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center"
                                >
                                    <div className="w-8 h-8 bg-red-500 rounded-sm" />
                                </button>
                            ) : videoRecorder.videoUrl ? (
                                <button
                                    onClick={handleSendVideo}
                                    className="p-4 rounded-full bg-teal-600 text-white hover:bg-teal-700 shadow-lg"
                                >
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </button>
                            ) : (
                                <button
                                    onClick={videoRecorder.startRecording}
                                    className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center"
                                >
                                    <div className="w-14 h-14 bg-red-500 rounded-full" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {videoRecorder.videoUrl && (
                    <div className="absolute top-4 right-4">
                        <button onClick={videoRecorder.startRecording} className="text-white underline">Retake</button>
                    </div>
                )}
            </div>
        );
    }

    // Default Text Input UI
    return (
        <div className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t dark:border-slate-700 p-3 sm:p-4 pb-safe z-40 ${animate ? 'animate-slide-up' : ''} ${className}`}>
            <div className="max-w-3xl mx-auto flex items-end gap-2 sm:gap-3">
                {/* Media Buttons */}
                {!hideMedia && (
                    <div className="flex gap-1 sm:gap-2 pb-1">
                        <button
                            onClick={async () => {
                                try {
                                    // Request microphone permission
                                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                                    stream.getTracks().forEach(track => track.stop()); // Stop the test stream
                                    setMode('audio');
                                    audioRecorder.startRecording();
                                } catch (error) {
                                    console.error('Microphone permission denied:', error);
                                    alert('🎤 Microphone access is required to record audio. Please allow microphone access in your browser settings.');
                                }
                            }}
                            disabled={isLoading}
                            className="p-2 sm:p-3 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            title="Record Audio"
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                        </button>
                        <button
                            onClick={async () => {
                                try {
                                    // Request camera and microphone permission
                                    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                                    stream.getTracks().forEach(track => track.stop()); // Stop the test stream
                                    setMode('video');
                                    videoRecorder.startRecording();
                                } catch (error) {
                                    console.error('Camera permission denied:', error);
                                    alert('📹 Camera and microphone access are required to record video. Please allow access in your browser settings.');
                                }
                            }}
                            disabled={isLoading}
                            className="p-2 sm:p-3 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            title="Record Video"
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </button>
                    </div>
                )}

                {/* Text Input */}
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        name="description"
                        data-testid="chat-input-textarea"
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
                        className="w-full bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none max-h-32 min-h-[44px]"
                        rows={1}
                    />
                </div>

                {/* Send Button */}
                <button
                    onClick={handleSendText}
                    disabled={!text.trim() || isLoading}
                    data-testid="chat-send-button"
                    className={`
            p-3 rounded-full transition-all duration-200
            ${text.trim() && !isLoading
                            ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-md transform hover:scale-105'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                        }
          `}
                >
                    {isLoading ? (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
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
