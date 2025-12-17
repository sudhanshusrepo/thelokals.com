import React, { useState } from 'react';
import { DocType, ProviderProfile } from '../types';

interface DocUploadProps {
    docType: DocType;
    currentDoc?: { url: string; verified: boolean };
    updateData: (updates: Partial<ProviderProfile>) => void;
}

export const DocUpload: React.FC<DocUploadProps> = ({ docType, currentDoc, updateData }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);

        // Simulate an upload
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newDoc = { url: URL.createObjectURL(file), verified: false };
        updateData({ documents: { [docType]: newDoc } });

        setUploading(false);
        setFile(null);
    };

    const getDocName = () => {
        switch(docType) {
            case DocType.GovtID: return "Government ID";
            case DocType.PAN: return "PAN Card";
            case DocType.BankDetails: return "Bank Statement";
            case DocType.Selfie: return "Live Selfie";
            default: return "Document";
        }
    }

    return (
        <div className="p-4 border rounded-lg bg-slate-50">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-semibold text-slate-800">{getDocName()}</p>
                    {currentDoc ? (
                        <div className="flex items-center mt-1">
                            <a href={currentDoc.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">View Document</a>
                            <span className={`ml-3 text-xs font-bold px-2 py-1 rounded-full ${currentDoc.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {currentDoc.verified ? 'Verified' : 'Pending'}
                            </span>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">Not uploaded yet.</p>
                    )}
                </div>
                
                {!currentDoc && (
                     <div className="flex items-center">
                        <input type="file" id={`file-${docType}`} className="hidden" onChange={handleFileChange} />
                        <label htmlFor={`file-${docType}`} className="cursor-pointer px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-100">
                           {file ? 'File Selected' : 'Choose File'}
                        </label>
                        {file && <button onClick={handleUpload} disabled={uploading} className="ml-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold">
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>}
                    </div>
                )}
            </div>
        </div>
    );
};