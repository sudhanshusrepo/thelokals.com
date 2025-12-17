import React from 'react';
import { ProviderProfile } from '../../types';

interface StepProps {
  data: ProviderProfile;
  updateData: (d: Partial<ProviderProfile>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const BasicDetailsStep: React.FC<StepProps> = ({ data, updateData, onNext, onBack }) => {
  const canProceed = data.fullName && data.dob && data.gender && data.city && data.locality;
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <h2 className="text-xl font-semibold text-slate-700">Your Basic Details</h2>
        <p className="text-slate-500 mt-2">Tell us a bit about yourself. This information will be visible on your public profile.</p>

        <div className="mt-6 space-y-4">
          <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-600">Full Name</label>
              <input 
                  type="text" 
                  id="fullName" 
                  value={data.fullName}
                  onChange={e => updateData({ fullName: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                  placeholder="e.g. Suresh Kumar"
              />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label htmlFor="dob" className="block text-sm font-medium text-slate-600">Date of Birth</label>
                <input 
                    type="date" 
                    id="dob" 
                    value={data.dob}
                    onChange={e => updateData({ dob: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
             <div>
                <label htmlFor="gender" className="block text-sm font-medium text-slate-600">Gender</label>
                <select 
                    id="gender" 
                    value={data.gender}
                    onChange={e => updateData({ gender: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
            </div>
          </div>
          <div>
              <label htmlFor="city" className="block text-sm font-medium text-slate-600">City</label>
              <input 
                  type="text" 
                  id="city" 
                  value={data.city}
                  onChange={e => updateData({ city: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                  placeholder="e.g. Bangalore"
              />
          </div>
          <div>
              <label htmlFor="locality" className="block text-sm font-medium text-slate-600">Locality / Area</label>
              <input 
                  type="text" 
                  id="locality" 
                  value={data.locality}
                  onChange={e => updateData({ locality: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                  placeholder="e.g. Koramangala 5th Block"
              />
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 transition-colors">
          Back
        </button>
        <button onClick={onNext} disabled={!canProceed} className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400">
          Next
        </button>
      </div>
    </div>
  );
};