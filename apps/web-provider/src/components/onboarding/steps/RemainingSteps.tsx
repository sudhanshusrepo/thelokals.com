// Placeholder components for remaining steps
import React from 'react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';

export const DocumentsStep: React.FC<any> = ({ onNext, onBack }) => (
    <Card>
        <h2 className="text-2xl font-bold text-[#0A2540] mb-6">Document Upload</h2>
        <p className="text-[#64748B] mb-6">Upload your Aadhaar card for verification</p>
        <div className="border-2 border-dashed border-[#E2E8F0] rounded-xl p-12 text-center mb-6">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-[#64748B]">Drag & drop or click to upload</p>
        </div>
        <div className="flex gap-4">
            <Button variant="outline" onClick={onBack} className="flex-1">← Back</Button>
            <Button onClick={onNext} className="flex-1">Continue →</Button>
        </div>
    </Card>
);

export const BankingStep: React.FC<any> = ({ onNext, onBack }) => (
    <Card>
        <h2 className="text-2xl font-bold text-[#0A2540] mb-6">Banking Details</h2>
        <p className="text-[#64748B] mb-6">Add your bank account for receiving payments</p>
        <div className="space-y-4 mb-6">
            <input className="w-full px-4 py-3 rounded-xl border-2 border-[#E2E8F0]" placeholder="Account Number" />
            <input className="w-full px-4 py-3 rounded-xl border-2 border-[#E2E8F0]" placeholder="IFSC Code" />
            <input className="w-full px-4 py-3 rounded-xl border-2 border-[#E2E8F0]" placeholder="Account Holder Name" />
        </div>
        <div className="flex gap-4">
            <Button variant="outline" onClick={onBack} className="flex-1">← Back</Button>
            <Button onClick={onNext} className="flex-1">Continue →</Button>
        </div>
    </Card>
);

export const ReviewStep: React.FC<any> = ({ data, onSubmit, onBack, isSubmitting }) => (
    <Card>
        <h2 className="text-2xl font-bold text-[#0A2540] mb-6">Review & Submit</h2>
        <p className="text-[#64748B] mb-6">Please review your information before submitting</p>
        <div className="bg-[#F5F7FB] rounded-xl p-6 mb-6">
            <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
        </div>
        <div className="flex gap-4">
            <Button variant="outline" onClick={onBack} className="flex-1">← Back</Button>
            <Button onClick={onSubmit} className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
        </div>
    </Card>
);
