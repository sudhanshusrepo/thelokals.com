import React from 'react';
import { designTokensV2 } from '../../theme/design-tokens-v2';
import NextImage from 'next/image';
import { getServiceImageUrl } from '../../utils/imageUtils';
import { Calendar, Clock, ChevronRight } from 'lucide-react';

interface StatusCardProps {
    booking: {
        id: string;
        serviceName: string;
        providerName?: string;
        status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
        date: string;
        time: string;
        imageUrl?: string;
    };
    onClick?: () => void;
}

export const StatusCard: React.FC<StatusCardProps> = ({ booking, onClick }) => {
    const isAssigned = booking.status === 'assigned' || booking.status === 'in_progress';

    return (
        <div
            onClick={onClick}
            className="group relative overflow-hidden bg-white rounded-v2-card shadow-v2-card cursor-pointer transition-transform active:scale-[0.98]"
            style={{
                height: designTokensV2.dimensions.statusCard.height,
                display: 'flex',
                alignItems: 'center',
                padding: '16px'
            }}
        >
            {/* Left: Progress Indicator / Icon */}
            <div className="mr-4 relative">
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '12px',
                    background: designTokensV2.colors.background.primary,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    position: 'relative'
                }}>
                    <NextImage
                        src={booking.imageUrl || getServiceImageUrl(booking.serviceName)}
                        alt={booking.serviceName}
                        fill
                        className="object-contain p-2"
                    />
                </div>

                {/* Status Dot */}
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isAssigned ? 'bg-v2-accent-success' : 'bg-v2-accent-warning'
                    }`} />
            </div>

            {/* Center: Info */}
            <div className="flex-1">
                <h3 className="text-v2-text-primary font-semibold text-lg leading-tight mb-1 line-clamp-1">
                    {booking.serviceName}
                </h3>
                <div className="flex items-center gap-3 text-sm text-v2-text-secondary">
                    <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-gray-400" />
                        <span>{booking.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock size={12} className="text-gray-400" />
                        <span>{booking.time}</span>
                    </div>
                </div>
                <div className="mt-1 text-xs font-medium text-v2-accent-success">
                    {isAssigned ? 'Provider assigned' : 'Finding best provider...'}
                </div>
            </div>

            {/* Right: Action */}
            <div className="pl-4">
                <div className="bg-v2-bg shadow-sm p-2 rounded-full group-hover:bg-v2-gradient group-hover:text-white transition-colors duration-300">
                    <ChevronRight size={20} />
                </div>
            </div>
        </div>
    );
};
