import React from 'react';
import { Button } from '../../ui/Button';

interface WelcomeStepProps {
    onNext: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
    return (
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-3xl font-bold text-primary mb-4">
                Welcome to lokals
            </h1>
            <p className="text-muted mb-8 text-lg">
                Complete your registration in a few simple steps to start earning.
            </p>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border mb-8">
                <h3 className="font-semibold text-primary mb-4">What you'll need:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                            📱
                        </div>
                        <div>
                            <p className="font-medium text-primary">Phone Number</p>
                            <p className="text-xs text-muted">For verification</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                            🆔
                        </div>
                        <div>
                            <p className="font-medium text-primary">Aadhaar Card</p>
                            <p className="text-xs text-muted">Identity proof</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                            👤
                        </div>
                        <div>
                            <p className="font-medium text-primary">Profile Photo</p>
                            <p className="text-xs text-muted">For customers to recognize you</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                            🏦
                        </div>
                        <div>
                            <p className="font-medium text-primary">Bank Details</p>
                            <p className="text-xs text-muted">To receive payments</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between text-sm text-muted">
                <span>Estimated time: <strong className="text-primary">5-7 minutes</strong></span>
                <span>Secure & Confidential 🔒</span>
            </div>
            <Button onClick={onNext} size="lg" className="w-full md:w-auto">
                Let's Get Started →
            </Button>
        </div>
    );
};
