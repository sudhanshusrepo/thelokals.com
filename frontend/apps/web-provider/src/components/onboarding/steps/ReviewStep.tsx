import React from 'react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';

interface ReviewStepProps {
    data: any;
    onSubmit: () => void;
    onBack: () => void;
    isSubmitting: boolean;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
    data,
    onSubmit,
    onBack,
    isSubmitting
}) => {
    const { personalInfo, professionalDetails, documents, banking } = data;

    return (
        <div className="animate-fade-in-up">
            <div className="text-center mb-6">
                <div className="text-5xl mb-3">🎉</div>
                <h2 className="text-2xl font-bold text-primary mb-2">Almost There!</h2>
                <p className="text-muted">Review your information before submitting</p>
            </div>

            <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-white border border-border rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-primary">Personal Information</h3>
                        <Badge variant="approved">Complete</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted">Name:</span>
                            <span className="font-medium text-primary">{personalInfo?.fullName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted">Phone:</span>
                            <span className="font-medium text-primary">{personalInfo?.phone || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted">Email:</span>
                            <span className="font-medium text-primary">{personalInfo?.email || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Professional Details */}
                <div className="bg-white border border-border rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-primary">Professional Details</h3>
                        <Badge variant="approved">Complete</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted">Category:</span>
                            <span className="font-medium text-primary">{professionalDetails?.category || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted">Experience:</span>
                            <span className="font-medium text-primary">{professionalDetails?.experienceYears || 0} years</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted">Service Area:</span>
                            <span className="font-medium text-primary">{professionalDetails?.serviceArea || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Documents */}
                <div className="bg-white border border-border rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-primary">Documents</h3>
                        <Badge variant="approved">Uploaded</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-status-accepted">✓</span>
                            <span className="text-primary">Aadhaar Card</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-status-accepted">✓</span>
                            <span className="text-primary">Profile Photo</span>
                        </div>
                    </div>
                </div>

                {/* Banking */}
                <div className="bg-white border border-border rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-primary">Banking Details</h3>
                        <Badge variant="approved">Verified</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted">Account Holder:</span>
                            <span className="font-medium text-primary">{banking?.accountHolderName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted">Account Number:</span>
                            <span className="font-medium text-primary">
                                ****{banking?.accountNumber?.slice(-4) || 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted">IFSC Code:</span>
                            <span className="font-medium text-primary">{banking?.ifscCode || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* What Happens Next */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                        <li>Our team will review your application (usually within 24 hours)</li>
                        <li>You'll receive an email/SMS once approved</li>
                        <li>Start accepting bookings and earning immediately!</li>
                    </ol>
                </div>
            </div>

            <div className="flex gap-4 mt-8">
                <Button variant="outline" onClick={onBack} className="flex-1" disabled={isSubmitting}>
                    ← Back
                </Button>
                <Button
                    onClick={onSubmit}
                    variant="secondary"
                    className="flex-1"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Application 🚀'}
                </Button>
            </div>
        </div>
    );
};
