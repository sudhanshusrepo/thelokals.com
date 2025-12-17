import React from 'react';
import { ProviderProfile } from '../../types';

interface StepProps {
  data: ProviderProfile;
  updateData: (d: Partial<ProviderProfile>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const GuidelinesStep: React.FC<StepProps> = ({ data, updateData, onNext, onBack }) => {
  const handleAccept = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData({ guidelinesAccepted: e.target.checked });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <h2 className="text-xl font-semibold text-slate-700">Community Guidelines</h2>
        <p className="text-slate-500 mt-2">Please read and accept our guidelines to ensure a safe and professional community.</p>

        <div className="mt-6 h-64 overflow-y-auto p-4 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-600 prose prose-sm">
           <h4>1. Professionalism</h4>
           <p>Always maintain a high standard of professionalism. Communicate clearly and respectfully with clients. Arrive on time and complete the job as agreed.</p>
           <h4>2. Safety</h4>
           <p>Your safety and the safety of your clients is paramount. Follow all safety protocols relevant to your service. Report any unsafe conditions immediately.</p>
           <h4>3. Quality of Work</h4>
           <p>Deliver high-quality work that meets or exceeds client expectations. Use appropriate tools and materials. Clean up your work area after the job is complete.</p>
           <h4>4. Payments</h4>
           <p>All payments must be processed through the Lokals platform. This ensures security for both you and the client. Do not solicit or accept cash payments.</p>
           <h4>5. Cancellations</h4>
           <p>Provide at least 24 hours notice for any cancellations. Repeated last-minute cancellations may affect your provider rating and status on the platform.</p>
        </div>

        <div className="mt-6">
            <label className="flex items-center">
                <input 
                    type="checkbox" 
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                    checked={data.guidelinesAccepted}
                    onChange={handleAccept}
                />
                <span className="ml-3 text-sm text-slate-600">I have read and agree to the community guidelines.</span>
            </label>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 transition-colors">
          Back
        </button>
        <button onClick={onNext} disabled={!data.guidelinesAccepted} className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400">
          I Agree & Continue
        </button>
      </div>
    </div>
  );
};