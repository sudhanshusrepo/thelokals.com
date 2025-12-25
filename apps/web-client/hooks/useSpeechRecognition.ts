import { useState, useEffect, useRef } from 'react';

export interface SpeechRecognitionHook {
    isListening: boolean;
    transcript: string;
    error: string | null;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
    isSupported: boolean;
}

export const useSpeechRecognition = (): SpeechRecognitionHook => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState(false);

    // Use a ref to store the recognition instance to persist across renders
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Check for browser support
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (SpeechRecognition) {
            setIsSupported(true);
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false; // Stop after one sentence/phrase
            recognitionRef.current.interimResults = true; // Show results while speaking
            recognitionRef.current.lang = 'en-US'; // Default to English

            recognitionRef.current.onstart = () => {
                setIsListening(true);
                setError(null);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                setIsListening(false);
                if (event.error === 'not-allowed') {
                    setError('permission-denied');
                } else if (event.error === 'no-speech') {
                    setError('no-speech');
                } else {
                    setError(event.error);
                }
            };

            recognitionRef.current.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        // Normally we might handle interim results differently, 
                        // but for search input, update as we go is fine or just wait for final.
                        // Let's just use the latest interim or final for the input value.
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                setTranscript(finalTranscript);
            };
        } else {
            setIsSupported(false);
            setError('not-supported');
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            try {
                // Reset text when starting new session if desired, 
                // or keep appending. Here we generally want to replace search query.
                setTranscript('');
                recognitionRef.current.start();
            } catch (e) {
                console.error("Speech recognition start error:", e);
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    };

    const resetTranscript = () => {
        setTranscript('');
    };

    return {
        isListening,
        transcript,
        error,
        startListening,
        stopListening,
        resetTranscript,
        isSupported
    };
};
