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
        <Card>
            <div className="text-center mb-6">
                <div className="text-5xl mb-3">🎉</div>
                <h2 className="text-2xl font-bold text-[#0A2540] mb-2">Almost There!</h2>
                <p className="text-[#64748B]">Review your information before submitting</p>
            </div>

            <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-[#F5F7FB] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-[#0A2540]">Personal Information</h3>
                        <Badge variant="approved">Complete</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-[#64748B]">Name:</span>
                            <span className="font-medium text-[#0A2540]">{personalInfo?.fullName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#64748B]">Phone:</span>
                            <span className="font-medium text-[#0A2540]">{personalInfo?.phone || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#64748B]">Email:</span>
                            <span className="font-medium text-[#0A2540]">{personalInfo?.email || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Professional Details */}
                <div className="bg-[#F5F7FB] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-[#0A2540]">Professional Details</h3>
                        <Badge variant="approved">Complete</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-[#64748B]">Category:</span>
                            <span className="font-medium text-[#0A2540]">{professionalDetails?.category || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#64748B]">Experience:</span>
                            <span className="font-medium text-[#0A2540]">{professionalDetails?.experienceYears || 0} years</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#64748B]">Service Area:</span>
                            <span className="font-medium text-[#0A2540]">{professionalDetails?.serviceArea || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Documents */}
                <div className="bg-[#F5F7FB] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-[#0A2540]">Documents</h3>
                        <Badge variant="approved">Uploaded</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span className="text-[#0A2540]">Aadhaar Card</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span className="text-[#0A2540]">Profile Photo</span>
                        </div>
                    </div>
                </div>

                {/* Banking */}
                <div className="bg-[#F5F7FB] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-[#0A2540]">Banking Details</h3>
                        <Badge variant="approved">Verified</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-[#64748B]">Account Holder:</span>
                            <span className="font-medium text-[#0A2540]">{banking?.accountHolderName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#64748B]">Account Number:</span>
                            <span className="font-medium text-[#0A2540]">
                                ****{banking?.accountNumber?.slice(-4) || 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#64748B]">IFSC Code:</span>
                            <span className="font-medium text-[#0A2540]">{banking?.ifscCode || 'N/A'}</span>
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
        </Card>
    );
};
