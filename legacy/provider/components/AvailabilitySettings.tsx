import React, { useState, useEffect } from 'react';
import { backend } from '../services/backend';
import { toast } from 'react-hot-toast';

export const AvailabilitySettings: React.FC = () => {
    const [schedule, setSchedule] = useState<{
        days: string[];
        startTime: string;
        endTime: string;
        enabled: boolean;
    }>({
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        startTime: '09:00',
        endTime: '17:00',
        enabled: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    useEffect(() => {
        loadSchedule();
    }, []);

    const loadSchedule = async () => {
        try {
            setLoading(true);
            const data = await backend.availability.getSchedule();
            if (data) {
                // Simple MVP mapping: assuming simple schedule structure
                // If data is complex, we might need a better mapper.
                // For MVP, we use the simple structure stored.
                setSchedule(data);
            }
        } catch (error) {
            console.error('Failed to load schedule', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await backend.availability.updateSchedule(schedule);
            toast.success('Availability updated successfully');
        } catch (error) {
            console.error('Failed to save schedule', error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const toggleDay = (day: string) => {
        setSchedule(prev => ({
            ...prev,
            days: prev.days.includes(day)
                ? prev.days.filter(d => d !== day)
                : [...prev.days, day]
        }));
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading settings...</div>;

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6 text-slate-900">Availability Settings</h1>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-8">

                {/* Active Toggle */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-slate-900">Accept Online Bookings</h3>
                        <p className="text-sm text-slate-500">Turn this off to pause new requests</p>
                    </div>
                    <button
                        onClick={() => setSchedule(s => ({ ...s, enabled: !s.enabled }))}
                        className={`w-14 h-8 rounded-full transition-colors relative ${schedule.enabled ? 'bg-teal-500' : 'bg-slate-300'
                            }`}
                    >
                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform shadow-sm ${schedule.enabled ? 'left-7' : 'left-1'
                            }`} />
                    </button>
                </div>

                <hr className="border-slate-100" />

                {/* Working Days */}
                <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Working Days</h3>
                    <div className="flex flex-wrap gap-2">
                        {WEEKDAYS.map(day => (
                            <button
                                key={day}
                                onClick={() => toggleDay(day)}
                                className={`w-10 h-10 rounded-full font-medium transition-all ${schedule.days.includes(day)
                                        ? 'bg-teal-600 text-white shadow-md transform scale-105'
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                    }`}
                            >
                                {day.charAt(0)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Working Hours */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Start Time</label>
                        <input
                            type="time"
                            value={schedule.startTime}
                            onChange={(e) => setSchedule(s => ({ ...s, startTime: e.target.value }))}
                            className="w-full rounded-lg border-slate-300 focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">End Time</label>
                        <input
                            type="time"
                            value={schedule.endTime}
                            onChange={(e) => setSchedule(s => ({ ...s, endTime: e.target.value }))}
                            className="w-full rounded-lg border-slate-300 focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>
                </div>

                {/* Save Button */}
                <div className="pt-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg ${saving ? 'bg-slate-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 hover:shadow-xl'
                            }`}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AvailabilitySettings;
