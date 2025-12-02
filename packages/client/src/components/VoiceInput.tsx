import React, { useState, useRef } from 'react';
import { voiceInputService } from '@thelocals/core/services/voiceInputService';

interface VoiceInputProps {
    onTranscript: (text: string) => void;
    onError?: (error: Error) => void;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, onError }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                stream.getTracks().forEach(track => track.stop());

                // Transcribe
                setIsProcessing(true);
                try {
                    const text = await voiceInputService.transcribeAudio(audioBlob);
                    setTranscript(text);
                    onTranscript(text);
                } catch (error) {
                    console.error('Transcription error:', error);
                    onError?.(error as Error);
                } finally {
                    setIsProcessing(false);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Microphone access error:', error);
            onError?.(error as Error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <div className="voice-input-container">
            <div className="voice-button-wrapper">
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isProcessing}
                    className={`voice-button ${isRecording ? 'recording' : ''} ${isProcessing ? 'processing' : ''}`}
                >
                    <div className="voice-icon">
                        {isProcessing ? (
                            <div className="spinner">⏳</div>
                        ) : isRecording ? (
                            <div className="recording-pulse">🎤</div>
                        ) : (
                            <span>🎤</span>
                        )}
                    </div>
                    <div className="voice-text">
                        {isProcessing ? 'Processing...' : isRecording ? 'Tap to stop' : 'Tap to speak'}
                    </div>
                </button>
            </div>

            {transcript && (
                <div className="transcript-display">
                    <div className="transcript-label">You said:</div>
                    <div className="transcript-text">"{transcript}"</div>
                </div>
            )}

            <style>{`
        .voice-input-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
        }

        .voice-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 50%;
          width: 140px;
          height: 140px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .voice-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .voice-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .voice-button.recording {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          animation: pulse 1.5s ease-in-out infinite;
        }

        .voice-button.processing {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        .voice-icon {
          font-size: 3rem;
        }

        .recording-pulse {
          animation: pulse 1s ease-in-out infinite;
        }

        .voice-text {
          color: white;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .transcript-display {
          background: white;
          border-radius: 12px;
          padding: 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          width: 100%;
        }

        .transcript-label {
          font-size: 0.75rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }

        .transcript-text {
          font-size: 1rem;
          color: #1f2937;
          font-style: italic;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};
