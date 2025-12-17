import React from 'react';

interface StepperProps {
  currentStep: number;
  totalSteps: number;
}

export const Stepper: React.FC<StepperProps> = ({ currentStep, totalSteps }) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map(step => (
        <React.Fragment key={step}>
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                step <= currentStep ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {step}
            </div>
          </div>
          {step < totalSteps && (
            <div
              className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                step < currentStep ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};