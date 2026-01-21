
import { useState, useRef } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { Loader2, Upload, FileText, CheckCircle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FileUploadProps {
    label: string;
    bucket?: string;
    path: string;
    value?: string;
    onUploadComplete: (url: string) => void;
    currentUrl?: string;
}

export const FileUpload = ({ label, bucket = 'providers', path, onUploadComplete, currentUrl }: FileUploadProps) => {
    const { uploadFile, uploading } = useStorage();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | undefined>(currentUrl);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File is too large (Max 5MB)");
            return;
        }

        try {
            const url = await uploadFile(bucket, `${path}/${Date.now()}_${file.name}`, file);
            setPreview(url);
            onUploadComplete(url);
            toast.success("File uploaded successfully");
        } catch (error) {
            console.error("Upload failed", error);
        }
    };

    return (
        <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg bg-white">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neutral-100 rounded flex items-center justify-center text-neutral-400 overflow-hidden">
                    {preview ? (
                        <img src={preview} alt="Doc" className="w-full h-full object-cover" />
                    ) : (
                        <FileText size={20} />
                    )}
                </div>
                <div>
                    <p className="font-medium text-neutral-900">{label}</p>
                    <p className={`text-xs ${currentUrl || preview ? 'text-green-600' : 'text-neutral-400'}`}>
                        {currentUrl || preview ? 'Uploaded' : 'Not Uploaded'}
                    </p>
                </div>
            </div>

            <div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,application/pdf"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className={`text-sm font-bold flex items-center gap-2 ${uploading ? 'text-neutral-400' : 'text-brand-green hover:underline'
                        }`}
                >
                    {uploading ? (
                        <>
                            <Loader2 size={14} className="animate-spin" /> Uploading...
                        </>
                    ) : (
                        currentUrl || preview ? 'Update' : 'Upload'
                    )}
                </button>
            </div>
        </div>
    );
};
