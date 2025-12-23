import React from 'react';
import { Button } from '../../ui/Button';

interface WelcomeStepProps {
    onNext: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
    return (
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-3xl font-bold text-[#0A2540] mb-4">
                Welcome to lokals!
            </h1>
            <p className="text-lg text-[#64748B] mb-6 max-w-2xl mx-auto">
                You're just a few steps away from joining thousands of providers earning more with flexible working hours.
            </p>

            <div className="bg-[#F5F7FB] rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-[#0A2540] mb-4">What you'll need:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">📱</span>
                        <div>
                            <p className="font-medium text-[#0A2540]">Phone Number</p>
                            <p className="text-sm text-[#64748B]">For verification</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">🆔</span>
                        <div>
                            <p className="font-medium text-[#0A2540]">Aadhaar Card</p>
                            <p className="text-sm text-[#64748B]">For identity verification</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">📸</span>
                        <div>
                            <p className="font-medium text-[#0A2540]">Profile Photo</p>
                            <p className="text-sm text-[#64748B]">To build trust</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">🏦</span>
                        <div>
                            <p className="font-medium text-[#0A2540]">Bank Details</p>
                            <p className="text-sm text-[#64748B]">For payouts</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-[#64748B] mb-6">
                <span>⏱️</span>
                <span>Estimated time: <strong className="text-[#0A2540]">5-7 minutes</strong></span>
            </div>

            <Button onClick={onNext} size="lg" className="w-full md:w-auto">
                Let's Get Started →
            </Button>
        </div>
    );
};
