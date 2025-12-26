import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Card } from '../../ui/Card';

interface PersonalInfoStepProps {
    data?: {
        fullName: string;
        phone: string;
        email: string;
        photo?: string;
    };
    onUpdate: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
    data,
    onUpdate,
    onNext,
    onBack
}) => {
    const [formData, setFormData] = useState(data || {
        fullName: '',
        phone: '',
        email: '',
        photo: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.fullName || formData.fullName.length < 3) {
            newErrors.fullName = 'Please enter your full name';
        }
        if (!formData.phone || !/^[0-9]{10}$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
        }
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            onUpdate({ personalInfo: formData });
            onNext();
        }
    };

    return (
        <Card>
            <h2 className="text-2xl font-bold text-primary mb-6">Personal Information</h2>

            <div className="space-y-4">
                <Input
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    error={errors.fullName}
                />

                <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    error={errors.phone}
                    helperText="We'll send you booking notifications here"
                />

                <Input
                    label="Email Address"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={errors.email}
                />

                {/* Photo Upload Placeholder */}
                <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                        Profile Photo (Optional)
                    </label>
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-accent transition-colors cursor-pointer">
                        <div className="text-4xl mb-2">📸</div>
                        <p className="text-sm text-muted">Click to upload or take a photo</p>
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
