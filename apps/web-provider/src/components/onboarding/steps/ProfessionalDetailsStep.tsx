import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Card } from '../../ui/Card';

interface ProfessionalDetailsStepProps {
    data?: {
        category: string;
        experienceYears: number;
        serviceArea: string;
        bio: string;
    };
    onUpdate: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
}

const CATEGORIES = [
    'Plumber', 'Electrician', 'Carpenter', 'Painter', 'AC Repair',
    'Appliance Repair', 'Pest Control', 'Cleaning', 'Other'
];

export const ProfessionalDetailsStep: React.FC<ProfessionalDetailsStepProps> = ({
    data,
    onUpdate,
    onNext,
    onBack
}) => {
    const [formData, setFormData] = useState(data || {
        category: '',
        experienceYears: 0,
        serviceArea: '',
        bio: ''
    });

    const handleNext = () => {
        onUpdate({ professionalDetails: formData });
        onNext();
    };

    return (
        <Card>
            <h2 className="text-2xl font-bold text-[#0A2540] mb-6">Professional Details</h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-[#0A2540] mb-2">
                        Service Category
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFormData({ ...formData, category: cat })}
                                className={`px-4 py-2 rounded-lg border-2 transition-all ${formData.category === cat
                                        ? 'border-[#12B3A6] bg-[#12B3A6]/10 text-[#0A2540] font-semibold'
                                        : 'border-[#E2E8F0] hover:border-[#12B3A6]/50'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <Input
                    label="Years of Experience"
                    type="number"
                    min="0"
                    placeholder="e.g., 5"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
                />

                <Input
                    label="Service Area"
                    placeholder="e.g., Indiranagar, Bangalore"
                    value={formData.serviceArea}
                    onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                    helperText="Where do you primarily provide services?"
                />

                <div>
                    <label className="block text-sm font-medium text-[#0A2540] mb-2">
                        Bio (Optional)
                    </label>
                    <textarea
                        className="w-full px-4 py-3 rounded-xl border-2 border-[#E2E8F0] focus:border-[#12B3A6] focus:ring-2 focus:ring-[#12B3A6] focus:outline-none transition-all"
                        rows={4}
                        placeholder="Tell customers about your expertise and what makes you stand out..."
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    />
                </div>
            </div>

            <div className="flex gap-4 mt-8">
                <Button variant="outline" onClick={onBack} className="flex-1">
                    ← Back
                </Button>
                <Button onClick={handleNext} className="flex-1" disabled={!formData.category}>
                    Continue →
                </Button>
            </div>
        </Card>
    );
};
