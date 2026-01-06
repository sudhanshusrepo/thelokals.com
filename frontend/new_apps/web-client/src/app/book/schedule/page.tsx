'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBooking } from '../../../contexts/BookingContext';

export default function ScheduleStep() {
    const router = useRouter();
    const { bookingData, updateBooking, canProceed, nextStep } = useBooking();

    // Mock Date Generation (Next 3 days)
    const dates = Array.from({ length: 3 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
            full: d.toISOString().split('T')[0],
            day: d.getDate(),
            weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
            label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' })
        };
    });

    const timeSlots = [
        '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM',
        '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
    ];

    const [selectedDate, setSelectedDate] = useState(bookingData?.scheduledDate || dates[0].full);

    const handleTimeSelect = (time: string) => {
        updateBooking({
            scheduledDate: selectedDate,
            scheduledTime: time
        });
    };

    const handleContinue = () => {
        if (canProceed('schedule')) {
            nextStep();
            router.push('/book/address');
        }
    };

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-xl font-bold mb-6 text-v2-text-primary">Select Date & Time</h2>

            {/* Date Strip */}
            <div className="flex gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
                {dates.map(date => {
                    const isSelected = selectedDate === date.full;
                    return (
                        <button
                            key={date.full}
                            onClick={() => setSelectedDate(date.full)}
                            className={`min-w-[80px] p-3 rounded-2xl border transition-all ${isSelected
                                ? 'border-v2-text-primary bg-v2-text-primary text-white shadow-md'
                                : 'border-gray-200 bg-white text-gray-700'
                                }`}
                        >
                            <div className="text-xs font-medium opacity-80 mb-1">{date.label}</div>
                            <div className="text-xl font-bold">{date.day}</div>
                        </button>
                    );
                })}
            </div>

            {/* Time Slots Grid */}
            <div className="grid grid-cols-3 gap-3 mb-auto">
                {timeSlots.map(time => {
                    const isSelected = bookingData?.scheduledTime === time && bookingData?.scheduledDate === selectedDate;
                    return (
                        <button
                            key={time}
                            onClick={() => handleTimeSelect(time)}
                            className={`py-3 px-2 rounded-xl text-sm font-medium border transition-all ${isSelected
                                ? 'border-v2-accent-success bg-green-50 text-green-800 ring-1 ring-green-500'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                        >
                            {time}
                        </button>
                    );
                })}
            </div>

            <button
                onClick={handleContinue}
                disabled={!canProceed('schedule')}
                className={`w-full py-4 rounded-v2-btn font-bold mt-6 transition-all ${canProceed('schedule')
                    ? 'bg-v2-text-primary text-white shadow-lg active:scale-[0.99]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
            >
                Continue
            </button>
        </div>
    );
}
