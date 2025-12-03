import { supabase } from '@thelocals/core/services/supabase';

export interface UploadResult {
    url: string;
    path: string;
    type: 'audio' | 'video';
}

export const mediaUploadService = {
    /**
     * Uploads a media file to Supabase Storage
     */
    async uploadMedia(file: Blob, type: 'audio' | 'video'): Promise<UploadResult> {
        const fileExt = type === 'audio' ? 'webm' : 'webm';
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${type}s/${fileName}`;

        const { data, error } = await supabase.storage
            .from('service-requests')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Upload error:', error);
            throw new Error(`Failed to upload ${type}: ${error.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
            .from('service-requests')
            .getPublicUrl(filePath);

        return {
            url: publicUrl,
            path: filePath,
            type
        };
    },

    /**
     * Transcribes the uploaded media using the backend Edge Function
     */
    async transcribeMedia(mediaUrl: string, type: 'audio' | 'video'): Promise<string> {
        const { data, error } = await supabase.functions.invoke('transcribe-media', {
            body: {
                mediaUrl,
                type
            }
        });

        if (error) {
            console.error('Transcription error:', error);
            throw new Error(`Failed to transcribe ${type}: ${error.message}`);
        }

        return data.text;
    }
};
