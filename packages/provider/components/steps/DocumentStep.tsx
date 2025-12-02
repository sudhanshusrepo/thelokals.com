import React from 'react';
import { ProviderProfile, ProviderDocument, DocType } from '../../types';
import { useToast } from '../Toast';
import { backend } from '../../services/backend';

interface StepProps {
    data: ProviderProfile;
    updateData: (d: Partial<ProviderProfile>) => void;
    onNext: () => void;
    onBack: () => void;
}

const DocUpload: React.FC<{ doc: ProviderDocument, onUpdate: (update: Partial<ProviderDocument>) => void }> = ({ doc, onUpdate }) => {
    const toast = useToast();
    const [isUploading, setIsUploading] = React.useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        onUpdate({ status: 'uploading' });

        try {
            const url = await backend.storage.upload(file);
            onUpdate({ status: 'uploaded', url });
            toast.success(`Uploaded ${doc.type} successfully!`);
        } catch (error) {
            onUpdate({ status: 'empty' });
            toast.error(`Upload failed: ${(error as Error).message}`);
        }
        setIsUploading(false);
    };

    const getStatusContent = () => {
        switch (doc.status) {
            case 'empty':
                return <span className="text-sm text-slate-500">Not uploaded</span>;
            case 'uploading':
                return <span className="text-sm text-indigo-500 animate-pulse">Uploading...</span>;
            case 'uploaded':
                return <span className="text-sm text-green-600 font-semibold">Uploaded</span>;
            case 'verified':
                return <span className="text-sm text-green-700 font-bold">Verified</span>;
            case 'rejected':
                return <span className="text-sm text-red-600 font-semibold">Rejected</span>;
        }
    }

    return (
        <div className="bg-slate-50 p-4 rounded-lg flex items-center justify-between">
            <div>
                <p className="font-semibold text-slate-700">{doc.type}</p>
                {getStatusContent()}
            </div>
            <div>
                <label htmlFor={`file-${doc.type}`} className={`px-4 py-2 text-sm font-bold rounded-md cursor-pointer transition-colors ${doc.status === 'uploaded' || doc.status === 'uploading' ? 'bg-slate-200 text-slate-500' : 'bg-white border border-slate-300 hover:bg-slate-100'}`}>
                    {isUploading ? 'Wait...' : (doc.status === 'uploaded' ? 'Re-upload' : 'Upload')}
                </label>
                <input type="file" id={`file-${doc.type}`} className="hidden" onChange={handleFileChange} disabled={isUploading || doc.status === 'uploaded'} />
            </div>
        </div>
    )
}

export const DocumentStep: React.FC<StepProps> = ({ data, updateData, onNext, onBack }) => {
    const allDocsUploaded = Object.values(data.documents).every(d => d.status === 'uploaded');

    const handleDocUpdate = (docType: DocType, updates: Partial<ProviderDocument>) => {
        const updatedDocs = {
            ...data.documents,
            [docType]: { ...data.documents[docType], ...updates }
        };
        updateData({ documents: updatedDocs });
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1">
                <h2 className="text-xl font-semibold text-slate-700">Upload Your Documents</h2>
                <p className="text-slate-500 mt-2">We need these to verify your identity and process payments. Your data is safe with us.</p>

                <div className="mt-6 space-y-3">
                    {Object.values(data.documents).map(doc =>
                        <DocUpload
                            key={doc.type}
                            doc={doc}
                            onUpdate={(updates) => handleDocUpdate(doc.type, updates)}
                        />
                    )}
                </div>
            </div>

            <div className="mt-8 flex justify-between">
                <button onClick={onBack} className="bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 transition-colors">
                    Back
                </button>
                <button onClick={onNext} disabled={!allDocsUploaded} className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400">
                    Next
                </button>
            </div>
        </div>
    );
};