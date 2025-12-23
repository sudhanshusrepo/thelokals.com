import React, { useState, useRef } from 'react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';

interface DocumentsStepProps {
    data?: {
        aadhaar?: string;
        photo?: string;
    };
    onUpdate: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export const DocumentsStep: React.FC<DocumentsStepProps> = ({
    data,
    onUpdate,
    onNext,
    onBack
}) => {
    const [formData, setFormData] = useState(data || {
        aadhaar: '',
        photo: ''
    });
    const [uploading, setUploading] = useState(false);
    const aadhaarInputRef = useRef<HTMLInputElement>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (file: File, type: 'aadhaar' | 'photo') => {
        setUploading(true);
        try {
            // Simulate upload - in production, upload to Supabase Storage
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setFormData(prev => ({ ...prev, [type]: base64 }));
                setUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Upload failed:', error);
            setUploading(false);
        }
    };

    const handleNext = () => {
        onUpdate({ documents: formData });
        onNext();
    };

    return (
        <Card>
            <h2 className="text-2xl font-bold text-[#0A2540] mb-2">Document Upload</h2>
            <p className="text-[#64748B] mb-6">Upload your documents for verification</p>

            <div className="space-y-6">
                {/* Aadhaar Upload */}
                <div>
                    <label className="block text-sm font-medium text-[#0A2540] mb-2">
                        Aadhaar Card *
                    </label>
                    <input
                        ref={aadhaarInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'aadhaar');
                        }}
                    />
                    {!formData.aadhaar ? (
                        <button
                            onClick={() => aadhaarInputRef.current?.click()}
                            className="w-full border-2 border-dashed border-[#E2E8F0] rounded-xl p-8 text-center hover:border-[#12B3A6] transition-colors"
                        >
                            <div className="text-5xl mb-3">📄</div>
                            <p className="text-[#0A2540] font-medium mb-1">Upload Aadhaar Card</p>
                            <p className="text-sm text-[#64748B]">Click to browse or drag & drop</p>
                        </button>
                    ) : (
                        <div className="border-2 border-[#12B3A6] bg-[#12B3A6]/5 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-[#12B3A6]/20 rounded-lg flex items-center justify-center">
                                    <span className="text-2xl">✓</span>
                                </div>
                                <div>
                                    <p className="font-medium text-[#0A2540]">Aadhaar Uploaded</p>
                                    <p className="text-sm text-[#64748B]">Document verified</p>
                                </div>
                            </div>
                            <button
                                onClick={() => aadhaarInputRef.current?.click()}
                                className="text-sm text-[#12B3A6] hover:underline"
                            >
                                Change
                            </button>
                        </div>
                    )}
                </div>

                {/* Profile Photo Upload */}
                <div>
                    <label className="block text-sm font-medium text-[#0A2540] mb-2">
                        Profile Photo *
                    </label>
                    <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        capture="user"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'photo');
                        }}
                    />
                    {!formData.photo ? (
                        <button
                            onClick={() => photoInputRef.current?.click()}
                            className="w-full border-2 border-dashed border-[#E2E8F0] rounded-xl p-8 text-center hover:border-[#12B3A6] transition-colors"
                        >
                            <div className="text-5xl mb-3">📸</div>
                            <p className="text-[#0A2540] font-medium mb-1">Take or Upload Photo</p>
                            <p className="text-sm text-[#64748B]">Use camera or select from gallery</p>
                        </button>
                    ) : (
                        <div className="border-2 border-[#12B3A6] bg-[#12B3A6]/5 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img src={formData.photo} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                                <div>
                                    <p className="font-medium text-[#0A2540]">Photo Uploaded</p>
                                    <p className="text-sm text-[#64748B]">Looking good!</p>
                                </div>
                            </div>
                            <button
                                onClick={() => photoInputRef.current?.click()}
                                className="text-sm text-[#12B3A6] hover:underline"
                            >
                                Retake
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex gap-3">
                        <span className="text-blue-600 text-xl">ℹ️</span>
                        <div className="text-sm text-blue-900">
                            <p className="font-medium mb-1">Why we need these documents:</p>
                            <ul className="list-disc list-inside space-y-1 text-blue-800">
                                <li>Verify your identity for customer safety</li>
                                <li>Comply with legal requirements</li>
                                <li>Build trust in the lokals community</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 mt-8">
                <Button variant="outline" onClick={onBack} className="flex-1" disabled={uploading}>
                    ← Back
                </Button>
                <Button
                    onClick={handleNext}
                    className="flex-1"
                    disabled={!formData.aadhaar || !formData.photo || uploading}
                >
                    {uploading ? 'Uploading...' : 'Continue →'}
                </Button>
            </div>
        </Card>
    );
};
