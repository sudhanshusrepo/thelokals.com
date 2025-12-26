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
        <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold text-primary mb-2">Document Upload</h2>
            <p className="text-muted mb-6">Upload your documents for verification</p>

            <div className="space-y-6">
                {/* Aadhaar Upload */}
                {/* Aadhaar Upload */}
                <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                        Aadhaar Card (Front & Back)
                    </label>
                    <input
                        ref={aadhaarInputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'aadhaar');
                        }}
                    />
                    {!formData.aadhaar ? (
                        <div
                            onClick={() => aadhaarInputRef.current?.click()}
                            className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent transition-colors cursor-pointer group"
                        >
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/10 transition-colors">
                                <span className="text-3xl text-gray-400 group-hover:text-accent">🆔</span>
                            </div>
                            <p className="text-primary font-medium mb-1">Upload Aadhaar Card</p>
                            <p className="text-xs text-muted">Supports JPG, PNG, PDF (Max 5MB)</p>
                        </div>
                    ) : (
                        <div className="border-2 border-accent bg-accent/5 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                                    <span className="text-xl">📄</span>
                                </div>
                                <div>
                                    <p className="font-medium text-primary">Aadhaar Uploaded</p>
                                    <p className="text-xs text-muted">Verified successfully</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setFormData(prev => ({ ...prev, aadhaar: '' }))}
                                className="text-sm text-accent hover:underline font-medium"
                            >
                                Remove
                            </button>
                        </div>
                    )}
                </div>

                {/* Profile Photo */}
                <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                        Profile Photo
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
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-border">
                            {formData.photo ? (
                                <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <span className="text-3xl">👤</span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            {!formData.photo ? (
                                <div
                                    onClick={() => photoInputRef.current?.click()}
                                    className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent transition-colors cursor-pointer group"
                                >
                                    <p className="text-primary font-medium mb-1">Take or Upload Photo</p>
                                    <p className="text-xs text-muted">Clear face photo recommended</p>
                                </div>
                            ) : (
                                <div className="border-2 border-accent bg-accent/5 rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <p className="font-medium text-primary">Photo Uploaded</p>
                                            <p className="text-xs text-muted">Looks good!</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setFormData(prev => ({ ...prev, photo: '' }))}
                                        className="text-sm text-accent hover:underline font-medium"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
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
        </div>
    );
};
