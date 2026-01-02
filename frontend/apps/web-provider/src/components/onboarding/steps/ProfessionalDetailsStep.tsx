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

    // Placeholder for new state and functions based on the provided snippet
    // In a real scenario, these would be properly defined.
    const serviceCategories = [
        { id: 'plumber', label: 'Plumber', icon: '🔧' },
        { id: 'electrician', label: 'Electrician', icon: '⚡' },
        { id: 'carpenter', label: 'Carpenter', icon: '🔨' },
        { id: 'painter', label: 'Painter', icon: '🎨' },
        { id: 'ac_repair', label: 'AC Repair', icon: '❄️' },
        { id: 'appliance_repair', label: 'Appliance Repair', icon: '🧺' },
        { id: 'pest_control', label: 'Pest Control', icon: '🐜' },
        { id: 'cleaning', label: 'Cleaning', icon: '🧼' },
        { id: 'other', label: 'Other', icon: '❓' },
    ];
    const [details, setDetails] = useState({
        category: formData.category,
        experienceYears: formData.experienceYears,
        serviceArea: formData.serviceArea,
        bio: formData.bio, // Bio is not in the new snippet, but keeping it for consistency
    });
    const [error, setError] = useState({
        category: '',
        experienceYears: '',
        serviceArea: '',
    });

    const handleCategorySelect = (categoryId: string) => {
        setDetails(prev => ({ ...prev, category: categoryId }));
        setFormData(prev => ({ ...prev, category: categoryId })); // Keep formData updated
    };

    const updateDetails = (updates: Partial<typeof details>) => {
        setDetails(prev => ({ ...prev, ...updates }));
        setFormData(prev => ({ ...prev, ...updates })); // Keep formData updated
    };

    return (
        <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold text-primary mb-6">Professional Details</h2>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                        Select your Service Category
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {serviceCategories.map((category) => (
                            <div
                                key={category.id}
                                onClick={() => handleCategorySelect(category.id)}
                                className={`
                                    p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 text-center
                                    ${details.category === category.id
                                        ? 'border-accent bg-accent/10 text-primary font-semibold'
                                        : 'border-border hover:border-accent/50'
                                    }
                                `}
                            >
                                <span className="text-2xl">{category.icon}</span>
                                <span className="text-sm">{category.label}</span>
                            </div>
                        ))}
                    </div>
                    {error.category && <p className="text-destructive text-xs mt-1">{error.category}</p>}
                </div>

                <div>
                    <Input
                        label="Years of Experience"
                        type="number"
                        min="0"
                        placeholder="e.g., 5"
                        value={formData.experienceYears}
                        onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
                    />
                </div>

                <Input
                    label="Service Area"
                    placeholder="e.g., Indiranagar, Bangalore"
                    value={formData.serviceArea}
                    onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                    helperText="Where do you primarily provide services?"
                />

                <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                        Bio (Optional)
                    </label>
                    <textarea
                        className="w-full px-4 py-3 rounded-xl border-2 border-border focus:border-accent focus:ring-2 focus:ring-accent focus:outline-none transition-all"
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
        </div>
    );
};
