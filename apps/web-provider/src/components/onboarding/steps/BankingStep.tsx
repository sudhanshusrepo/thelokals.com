import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Card } from '../../ui/Card';

interface BankingStepProps {
    data?: {
        accountNumber: string;
        ifscCode: string;
        accountHolderName: string;
    };
    onUpdate: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export const BankingStep: React.FC<BankingStepProps> = ({
    data,
    onUpdate,
    onNext,
    onBack
}) => {
    const [formData, setFormData] = useState(data || {
        accountNumber: '',
        ifscCode: '',
        accountHolderName: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [bankDetails, setBankDetails] = useState<{ bank: string; branch: string } | null>(null);

    const lookupIFSC = async (ifsc: string) => {
        if (ifsc.length === 11) {
            // Simulate IFSC lookup - in production, call IFSC API
            setBankDetails({
                bank: 'State Bank of India',
                branch: 'Indiranagar Branch'
            });
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.accountNumber || formData.accountNumber.length < 9) {
            newErrors.accountNumber = 'Please enter a valid account number';
        }
        if (!formData.ifscCode || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
            newErrors.ifscCode = 'Please enter a valid IFSC code';
        }
        if (!formData.accountHolderName || formData.accountHolderName.length < 3) {
            newErrors.accountHolderName = 'Please enter account holder name';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            onUpdate({ banking: formData });
            onNext();
        }
    };

    return (
        <Card>
            <h2 className="text-2xl font-bold text-[#0A2540] mb-2">Banking Details</h2>
            <p className="text-[#64748B] mb-6">Add your bank account for receiving payments</p>

            <div className="space-y-4">
                <Input
                    label="Account Holder Name"
                    placeholder="As per bank records"
                    value={formData.accountHolderName}
                    onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                    error={errors.accountHolderName}
                />

                <Input
                    label="Account Number"
                    type="text"
                    placeholder="Enter your account number"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    error={errors.accountNumber}
                />

                <div>
                    <Input
                        label="IFSC Code"
                        placeholder="e.g., SBIN0001234"
                        value={formData.ifscCode}
                        onChange={(e) => {
                            const ifsc = e.target.value.toUpperCase();
                            setFormData({ ...formData, ifscCode: ifsc });
                            lookupIFSC(ifsc);
                        }}
                        error={errors.ifscCode}
                        helperText="11-character code (e.g., SBIN0001234)"
                    />
                    {bankDetails && (
                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm font-medium text-green-900">{bankDetails.bank}</p>
                            <p className="text-xs text-green-700">{bankDetails.branch}</p>
                        </div>
                    )}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex gap-3">
                        <span className="text-amber-600 text-xl">🔒</span>
                        <div className="text-sm text-amber-900">
                            <p className="font-medium mb-1">Your banking information is secure</p>
                            <p className="text-amber-800">
                                We use bank-grade encryption to protect your data. Payments are processed weekly directly to your account.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 mt-8">
                <Button variant="outline" onClick={onBack} className="flex-1">
                    ← Back
                </Button>
                <Button onClick={handleNext} className="flex-1">
                    Continue →
                </Button>
            </div>
        </Card>
    );
};
