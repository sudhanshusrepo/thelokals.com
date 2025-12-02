import React, { useState } from 'react';
import { ProviderProfile, RegistrationStatus } from '../../types';
import { useToast } from '../Toast';
import { backend } from '../../services/backend';

interface StepProps {
  data: ProviderProfile;
  updateData: (d: Partial<ProviderProfile>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const ReviewStep: React.FC<StepProps> = ({ data, updateData, onBack }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const finalData = { ...data, registrationStatus: RegistrationStatus.Submitted };
      updateData(finalData);
      await backend.db.saveProfile(finalData);
      await backend.db.deleteDraft(); // Clear draft on successful submission
      toast.success('Application submitted successfully! We will review it and get back to you.');
      // Here you would typically redirect to a 'Thank You' or 'Pending Review' page
    } catch (err) {
      toast.error(`Submission failed: ${(err as Error).message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <h2 className="text-xl font-semibold text-slate-700">Review & Submit</h2>
        <p className="text-slate-500 mt-2">Please review your details one last time before submitting your application.</p>

        <div className="mt-6 bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
          <div className="p-4 flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Full Name</span>
            <span className="text-sm text-slate-800 font-semibold">{data.fullName}</span>
          </div>
          <div className="p-4 flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Phone</span>
            <span className="text-sm text-slate-800 font-semibold">{data.phoneNumber}</span>
          </div>
          <div className="p-4 flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Date of Birth</span>
            <span className="text-sm text-slate-800 font-semibold">{data.dob}</span>
          </div>
          <div className="p-4 flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Location</span>
            <span className="text-sm text-slate-800 font-semibold">{data.locality}, {data.city}</span>
          </div>
          <div className="p-4 flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Documents</span>
            <span className="text-sm text-green-600 font-semibold">{Object.values(data.documents).filter(d => d.status === 'uploaded').length} files uploaded</span>
          </div>
          <div className="p-4 flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Guidelines</span>
            <span className={`text-sm font-semibold ${data.guidelinesAccepted ? 'text-green-600' : 'text-red-600'}`}>
              {data.guidelinesAccepted ? 'Accepted' : 'Not Accepted'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 transition-colors">
          Back
        </button>
        <button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-green-700 transition-colors disabled:bg-green-400">
          {isSubmitting ? 'Submitting...' : 'Confirm & Submit Application'}
        </button>
      </div>
    </div>
  );
};