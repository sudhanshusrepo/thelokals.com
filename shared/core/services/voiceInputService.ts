// Voice Input Service - currently disabled as geminiService doesn't export the required methods

/**
 * Voice Input Service using Gemini Audio API
 */
export const voiceInputService = {
    /**
     * Record audio from microphone
     */
    async recordAudio(durationMs: number = 30000): Promise<Blob> {
        return new Promise((resolve, reject) => {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    const mediaRecorder = new MediaRecorder(stream);
                    const audioChunks: Blob[] = [];

                    mediaRecorder.ondataavailable = (event) => {
                        audioChunks.push(event.data);
                    };

                    mediaRecorder.onstop = () => {
                        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                        stream.getTracks().forEach(track => track.stop());
                        resolve(audioBlob);
                    };

                    mediaRecorder.start();

                    // Auto-stop after duration
                    setTimeout(() => {
                        if (mediaRecorder.state === 'recording') {
                            mediaRecorder.stop();
                        }
                    }, durationMs);
                })
                .catch(reject);
        });
    },

    /**
     * Convert audio to base64 for Gemini API
     */
    async audioToBase64(audioBlob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(audioBlob);
        });
    },

    /**
     * Transcribe audio using Gemini API
     */
    async transcribeAudio(audioBlob: Blob): Promise<string> {
        try {
            const base64Audio = await this.audioToBase64(audioBlob);

            const prompt = `
Transcribe this audio recording. The speaker is requesting a service.
Provide only the transcribed text, no additional commentary.
`;

            // Call Gemini with audio
            // const response = await geminiService.generateContentWithMedia(
            //     prompt,
            //     [{
            //         inlineData: {
            //             mimeType: 'audio/webm',
            //             data: base64Audio
            //         }
            //     }]
            // );

            // return response.trim();
            throw new Error('Voice transcription not yet implemented');
        } catch (error) {
            console.error('Transcription error:', error);
            throw new Error('Failed to transcribe audio. Please try again.');
        }
    },

    /**
     * Start voice recording and transcribe
     */
    async startVoiceInput(maxDurationMs: number = 30000): Promise<string> {
        const audioBlob = await this.recordAudio(maxDurationMs);
        const transcript = await this.transcribeAudio(audioBlob);
        return transcript;
    }
};
