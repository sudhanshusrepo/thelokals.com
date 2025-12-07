import React, { useState, useEffect, useRef } from 'react';

interface OnlineSlotPickerProps {
    onSelect: (date: Date, time: string) => void;
    selectedDate?: Date;
    selectedTime?: string;
}

export const OnlineSlotPicker: React.FC<OnlineSlotPickerProps> = ({ onSelect, selectedDate, selectedTime }) => {
    const [dates, setDates] = useState<Date[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Generate next 14 days
    useEffect(() => {
        const nextDates = [];
        const today = new Date();
        for (let i = 0; i < 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            nextDates.push(date);
        }
        setDates(nextDates);
    }, []);

    // Time slots (09:00 to 20:00)
    const timeSlots = [
        '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00',
        '17:00', '18:00', '19:00', '20:00'
    ];

    const formatDate = (date: Date) => {
        return {
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            date: date.getDate(),
            full: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        };
    };

    const isSameDate = (d1: Date, d2?: Date) => {
        return d2 && d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth();
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                Select a Slot
            </h3>

            {/* Date Scroller */}
            <div className="relative mb-6">
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto pb-2 gap-3 hide-scrollbar snap-x"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {dates.map((date, idx) => {
                        const { day, date: dateNum } = formatDate(date);
                        const isSelected = isSameDate(date, selectedDate);

                        return (
                            <button
                                key={idx}
                                onClick={() => onSelect(date, selectedTime || '')}
                                className={`flex-shrink-0 snap-start flex flex-col items-center justify-center w-16 h-20 rounded-xl border transition-all ${isSelected
                                        ? 'bg-teal-600 border-teal-600 text-white shadow-lg scale-105'
                                        : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-teal-400'
                                    }`}
                            >
                                <span className="text-xs font-medium uppercase">{day}</span>
                                <span className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                    {dateNum}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Time Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {timeSlots.map((time) => {
                    const isSelected = time === selectedTime;
                    return (
                        <button
                            key={time}
                            onClick={() => selectedDate && onSelect(selectedDate, time)}
                            disabled={!selectedDate}
                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${isSelected
                                    ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-2 border-teal-500'
                                    : 'bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border border-transparent hover:border-teal-300'
                                } ${!selectedDate ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {time}
                        </button>
                    );
                })}
            </div>

            {!selectedDate && (
                <p className="text-center text-xs text-slate-400 mt-4">
                    Please select a date first
                </p>
            )}
        </div>
    );
};
