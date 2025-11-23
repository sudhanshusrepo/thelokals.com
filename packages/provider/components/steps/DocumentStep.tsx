import React, { useState, useEffect } from 'react';
import { StepProps, DocType, ProviderDocument } from '../../types';
import { Button } from '../Button';
import { analyzeIdCard, checkSelfie } from '../../services/gemini';
import { DigiLockerModal } from '../DigiLockerModal';
import { backend } from '../../services/backend';
import { useToast } from '../Toast';

const FileUploadCard: React.FC<{
  label: string;
  doc: ProviderDocument;
  accept?: string;
  onUpload: (file: File) => void;
  onAnalyze?: () => void;
  onClear?: () => void;
}> = ({ label, doc, accept = "image/*", onUpload, onAnalyze, onClear }) => {
  const isDigiLocker = doc.source === 'digilocker';

  return (
    <div className={`border-2 border-dashed rounded-xl p-4 transition-colors relative group
      ${doc.status === 'error' ? 'border-red-300 bg-red-50' : 
        doc.status === 'verified' ? 
          (isDigiLocker ? 'border-[#007bff]/50 bg-blue-50/50' : 'border-green-500 bg-green-50') : 
        'border-slate-300 hover:border-brand-400 hover:bg-slate-50'
      }`}>
      
      {/* DigiLocker Badge */}
      {isDigiLocker && (
          <div className="absolute -top-3 right-4 bg-[#007bff] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 z-20">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              DIGILOCKER VERIFIED
          </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-slate-800">{label}</h4>
          <p className="text-xs text-slate-500 mt-1">
            {doc.status === 'empty' && 'Tap to upload'}
            {doc.status === 'uploading' && 'Uploading secure file...'}
            {doc.status === 'analyzing' && 'AI Analyzing...'}
            {doc.status === 'verified' && (isDigiLocker ? 'Verified instantly via DigiLocker' : 'Verified manually')}
            {doc.status === 'error' && <span className="text-red-600">{doc.error || 'Upload failed'}</span>}
            {doc.status === 'uploaded' && 'Ready for verification'}
          </p>
          {doc.extractedData?.fullName && (
              <p className="text-xs text-green-700 mt-1 font-mono flex items-center gap-1">
                  <span>Details Matched: {doc.extractedData.fullName}</span>
              </p>
          )}
        </div>
        
        {doc.previewUrl ? (
          <div className="h-16 w-16 bg-slate-200 rounded-lg overflow-hidden relative shadow-sm shrink-0">
            <img src={doc.previewUrl} alt="Preview" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${isDigiLocker ? 'bg-blue-100 text-[#007bff]' : 'bg-slate-100 text-slate-400'}`}>
             {isDigiLocker ? (
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
             ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
             )}
          </div>
        )}
      </div>

      {/* Input Overlay */}
      {!isDigiLocker && (
        <input
            type="file"
            accept={accept}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => {
            if (e.target.files?.[0]) onUpload(e.target.files[0]);
            }}
            disabled={doc.status === 'uploading' || doc.status === 'analyzing' || doc.status === 'verified'}
            style={{ display: (doc.status === 'uploading' || doc.status === 'analyzing' || doc.status === 'verified') ? 'none' : 'block' }}
        />
      )}
      
      {/* Actions */}
      <div className="mt-4 flex gap-2 z-10 relative min-h-[24px]">
         {/* AI Analysis Button for Manual Uploads */}
         {doc.previewUrl && onAnalyze && doc.status !== 'verified' && doc.status !== 'analyzing' && !isDigiLocker && (
             <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onAnalyze();
                }}
                className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full font-medium flex items-center gap-1 hover:bg-indigo-200 transition-colors"
             >
                 ✨ AI Auto-fill
             </button>
         )}

         {/* Clear Button (Visible for both manual and DigiLocker if verified) */}
         {doc.status !== 'empty' && doc.status !== 'uploading' && onClear && (
             <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onClear();
                }}
                className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-full font-medium flex items-center gap-1 hover:bg-red-100 border border-red-100 transition-colors"
             >
                 {doc.status === 'verified' ? 'Re-upload' : 'Remove'}
             </button>
         )}
      </div>
    </div>
  );
};

export const DocumentStep: React.FC<StepProps> = ({ data, updateData, onNext, onBack }) => {
  const [isAnalyzing, setAnalyzing] = useState(false);
  const [isUploading, setUploading] = useState(false);
  const [showDigiLocker, setShowDigiLocker] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!data.phoneNumber) {
        toast.error("Phone number not provided. Please go back.");
        onBack();
    }
  }, [data.phoneNumber, onBack, toast]);

  const handleUpload = async (type: DocType, file: File) => {
    setUploading(true);
    // 1. Set local state to uploading
    updateData({
      documents: {
        ...data.documents,
        [type]: {
          ...data.documents[type],
          file,
          status: 'uploading',
          error: undefined,
          source: 'manual'
        }
      }
    });

    try {
        // 2. Upload to backend
        const path = `providers/${data.phoneNumber}/${type.toLowerCase()}-${file.name}`;
        const { url, error } = await backend.storage.upload(file, path);

        if (error) throw error;

        // 3. Update with URL
        updateData({
            documents: {
              ...data.documents,
              [type]: {
                ...data.documents[type],
                file,
                previewUrl: url || undefined,
                status: 'uploaded',
              }
            }
          });
          toast.success("Document uploaded securely.");

    } catch (e: any) {
        let errorMessage = "Upload failed. Please try again.";
        if (e.message.includes('size')) {
            errorMessage = "File is too large. Please upload a file smaller than 10MB.";
        } else if (e.message.includes('type')) {
            errorMessage = "Invalid file type. Please upload an image.";
        }
        toast.error(errorMessage);
        updateData({
            documents: {
              ...data.documents,
              [type]: {
                ...data.documents[type],
                status: 'error',
                error: errorMessage
              }
            }
          });
    } finally {
        setUploading(false);
    }
  };

  const handleAIAnalysis = async (type: DocType) => {
    const doc = data.documents[type];
    if (!doc.file) return;

    setAnalyzing(true);
    const newData = { ...data };
    newData.documents[type] = { ...doc, status: 'analyzing' };
    updateData(newData);

    try {
        let result: any = {};
        if (type === DocType.GovtID) {
            result = await analyzeIdCard(doc.file);
            if (result.isValidId) {
                newData.fullName = result.fullName || data.fullName;
                newData.dob = result.dob || data.dob;
                newData.documents[type] = { ...doc, status: 'verified', extractedData: result, previewUrl: doc.previewUrl };
                updateData(newData);
                toast.success("ID verified successfully via AI!");
            } else {
                throw new Error("Could not verify ID card. Please ensure it is a valid Govt ID.");
            }
        } else if (type === DocType.Selfie) {
            result = await checkSelfie(doc.file);
             if (result.isClearSelfie) {
                newData.documents[type] = { ...doc, status: 'verified', extractedData: result, previewUrl: doc.previewUrl };
                updateData(newData);
                toast.success("Selfie verified!");
            } else {
                 throw new Error(result.description || "Selfie not clear.");
            }
        }

    } catch (e: any) {
        toast.error(e.message || "Analysis failed");
        newData.documents[type] = { ...doc, status: 'error', error: e.message || "Analysis failed", previewUrl: doc.previewUrl };
        updateData(newData);
    } finally {
        setAnalyzing(false);
    }
  };

  const handleDigiLockerSuccess = (dlData: any) => {
      setShowDigiLocker(false);
      const verifiedPreview = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Aadhaar_Logo.svg/1200px-Aadhaar_Logo.svg.png"; 

      updateData({
          fullName: dlData.name, 
          documents: {
              ...data.documents,
              [DocType.GovtID]: {
                  type: DocType.GovtID,
                  status: 'verified',
                  source: 'digilocker',
                  previewUrl: verifiedPreview,
                  extractedData: {
                      fullName: dlData.name,
                      idNumber: `XXXXXXXX${dlData.aadhaarLast4}`,
                      type: 'Aadhaar Card'
                  }
              },
              [DocType.PAN]: {
                  type: DocType.PAN,
                  status: 'verified',
                  source: 'digilocker',
                  previewUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Income_Tax_Department_India_Logo.svg/100px-Income_Tax_Department_India_Logo.svg.png",
                  extractedData: {
                      panNumber: dlData.pan,
                      fullName: dlData.name
                  }
              }
          }
      });
      toast.success("Details fetched from DigiLocker!");
  };

  const resetDocument = (type: DocType) => {
      updateData({
          documents: {
              ...data.documents,
              [type]: { type, status: 'empty' }
          }
      });
  };

  const canProceed = 
    (data.documents[DocType.GovtID].status === 'verified') && 
    (data.documents[DocType.Selfie].status === 'verified' || data.documents[DocType.Selfie].previewUrl);

  const isDigiLockerVerified = data.documents[DocType.GovtID].source === 'digilocker';
  const isLoading = isUploading || isAnalyzing;

  return (
    <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
      <DigiLockerModal 
        isOpen={showDigiLocker} 
        onClose={() => setShowDigiLocker(false)} 
        onSuccess={handleDigiLockerSuccess}
      />

      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-900">Upload Documents</h2>
        <p className="text-slate-500 mt-1">Verify your identity to start earning.</p>
      </div>

      {/* DigiLocker Banner */}
      {!isDigiLockerVerified && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 shadow-sm mb-6">
            <div className="flex gap-4 items-center">
                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-[#007bff]" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-slate-900">Recommended: Use DigiLocker</h3>
                    <p className="text-xs text-slate-600 mt-1">Instant approval. No manual uploads needed for ID & PAN.</p>
                </div>
                <Button 
                    variant="primary" 
                    className="bg-[#007bff] hover:bg-blue-600 border-none shadow-blue-500/30 text-xs px-4 py-2"
                    onClick={() => setShowDigiLocker(true)}
                >
                    Connect
                </Button>
            </div>
        </div>
      )}

      {/* Separator if not verified yet */}
      {!isDigiLockerVerified && (
        <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase font-medium">Or Upload Manually</span>
            <div className="flex-grow border-t border-slate-200"></div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 relative">
        <div className="relative">
             <FileUploadCard 
                label="Government ID (Aadhaar/Voter ID)" 
                doc={data.documents[DocType.GovtID]}
                onUpload={(f) => handleUpload(DocType.GovtID, f)}
                onAnalyze={() => handleAIAnalysis(DocType.GovtID)}
                onClear={() => resetDocument(DocType.GovtID)}
                />
        </div>

        <div className="relative">
            <FileUploadCard 
                label="PAN Card" 
                doc={data.documents[DocType.PAN]}
                onUpload={(f) => handleUpload(DocType.PAN, f)}
                onClear={() => resetDocument(DocType.PAN)}
            />
        </div>
        
        <div className="relative">
             <FileUploadCard 
                label="Profile Selfie" 
                doc={data.documents[DocType.Selfie]}
                accept="image/*;capture=user"
                onUpload={(f) => handleUpload(DocType.Selfie, f)}
                onAnalyze={() => handleAIAnalysis(DocType.Selfie)}
                onClear={() => resetDocument(DocType.Selfie)}
            />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" className="flex-1" onClick={onBack} disabled={isLoading}>
          Back
        </Button>
        <Button className="flex-1" onClick={onNext} disabled={!canProceed || isLoading}>
          {isUploading ? 'Uploading...' : isAnalyzing ? 'Analyzing...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};