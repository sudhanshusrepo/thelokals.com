
import { useState } from 'react';
import { createClient } from '../utils/supabase/client';
import { toast } from 'react-hot-toast';

export const useStorage = () => {
    const [uploading, setUploading] = useState(false);
    const supabase = createClient();

    const uploadFile = async (bucket: string, path: string, file: File) => {
        try {
            setUploading(true);
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(path, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (error) {
                throw error;
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(data.path);

            return publicUrl;
        } catch (error: any) {
            toast.error(error.message || "Error uploading file");
            throw error;
        } finally {
            setUploading(false);
        }
    };

    return {
        uploadFile,
        uploading
    };
};
