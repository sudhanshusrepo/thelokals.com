
import { useState, useRef, useCallback, useEffect } from 'react';

interface UseVideoRecorderReturn {
    isRecording: boolean;
    recordingTime: number;
    videoBlob: Blob | null;
    videoUrl: string | null;
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    resetRecording: () => void;
    error: string | null;
    videoRef: React.RefObject<HTMLVideoElement | null>;
}

export const useVideoRecorder = (maxDurationSeconds: number = 30): UseVideoRecorderReturn => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const checkPermission = async () => {
        if (!navigator.permissions || !navigator.permissions.query) return true;
        try {
            const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
            if (result.state === 'denied') {
                setError('Camera permission is denied. Please enable it in your browser settings.');
                return false;
            }
            return true;
        } catch (e) {
            // Some browsers might not support the query
            return true;
        }
    };

    const startRecording = useCallback(async () => {
        try {
            const hasPermission = await checkPermission();
            if (!hasPermission) return;

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }, // Prefer front camera on mobile
                audio: true
            });

            streamRef.current = stream;

            // Show preview
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }

            const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
                ? 'video/webm;codecs=vp9'
                : 'video/mp4';

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                const url = URL.createObjectURL(blob);
                setVideoBlob(blob);
                setVideoUrl(url);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
                if (videoRef.current) {
                    videoRef.current.srcObject = null;
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            setError(null);
            setRecordingTime(0);

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => {
                    if (prev >= maxDurationSeconds) {
                        stopRecording();
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);

        } catch (err: any) {
            console.error('Error accessing camera:', err);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError('Permission denied. Please allow camera access to record video.');
            } else if (err.name === 'NotFoundError') {
                setError('No camera found. Please connect a camera.');
            } else {
                setError('Could not access camera: ' + (err.message || 'Unknown error'));
            }
        }
    }, [maxDurationSeconds]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }, []);

    const resetRecording = useCallback(() => {
        setVideoBlob(null);
        if (videoUrl) {
            URL.revokeObjectURL(videoUrl);
            setVideoUrl(null);
        }
        setRecordingTime(0);
        setError(null);
    }, [videoUrl]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (videoUrl) URL.revokeObjectURL(videoUrl);
            // Ensure stream is stopped on unmount
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [videoUrl]);

    return {
        isRecording,
        recordingTime,
        videoBlob,
        videoUrl,
        startRecording,
        stopRecording,
        resetRecording,
        error,
        videoRef
    };
};
