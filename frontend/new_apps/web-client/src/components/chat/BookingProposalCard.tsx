import React from 'react';
import { Calendar, CreditCard, ArrowRight } from 'lucide-react';
import { designTokensV2 } from '../../theme/design-tokens-v2';

interface BookingProposalProps {
    serviceName: string;
    estimatedCost: string;
    onBook: () => void;
}

export const BookingProposalCard = ({ serviceName, estimatedCost, onBook }: BookingProposalProps) => {
    return (
        <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm mb-4 max-w-[85%] ml-auto mr-auto md:mr-0">
            <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-neutral-900">{serviceName}</h4>
                <div className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">
                    ESTIMATE
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <CreditCard size={14} />
                    <span>Est. Cost: <span className="font-semibold text-neutral-900">{estimatedCost}</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Calendar size={14} />
                    <span>Availability: <span className="text-green-600 font-medium">Today</span></span>
                </div>
            </div>

            <button
                onClick={onBook}
                className="w-full py-2 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
                style={{ background: designTokensV2.colors.gradient.css }}
            >
                Confirm Booking <ArrowRight size={14} />
            </button>
        </div>
    );
};
