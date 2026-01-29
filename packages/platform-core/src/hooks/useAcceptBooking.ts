
import { useState } from 'react';
import { liveBookingService } from '../services/liveBookingService';
import { logger } from '../services/logger';
import { AcceptBookingResponse } from '../types';

interface UseAcceptBookingResult {
    acceptBooking: (bookingId: string, providerId: string) => Promise<AcceptBookingResponse | null>;
    isLoading: boolean;
    error: string | null;
}

export const useAcceptBooking = (): UseAcceptBookingResult => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const acceptBooking = async (bookingId: string, providerId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await liveBookingService.acceptBooking(bookingId, providerId);

            if (!response.success) {
                // Handle "Job Taken" or "Expired"
                setError(response.message || 'Failed to accept booking');
                return response;
            }

            return response;
        } catch (err: any) {
            const msg = err.message || 'An unexpected error occurred';
            setError(msg);
            logger.error('useAcceptBooking', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { acceptBooking, isLoading, error };
};
