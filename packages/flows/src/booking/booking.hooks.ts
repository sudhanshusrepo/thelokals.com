import { useState, useCallback } from 'react';
import { BookingState, BookingContext } from './booking.state';
import { BookingFlow } from './booking.flow';

export const useBookingLogic = (initialState: BookingState = 'IDLE', initialContext: BookingContext = {}) => {
    const [state, setState] = useState<BookingState>(initialState);
    const [context, setContext] = useState<BookingContext>(initialContext);

    const send = useCallback((event: string, payload?: Partial<BookingContext>) => {

        let nextContext = context;
        if (payload) {
            nextContext = { ...context, ...payload };
            setContext(nextContext);
        }

        const nextState = BookingFlow.next(state, event, nextContext);

        if (nextState !== state) {
            console.log(`[BookingFlow] ${state} -> ${event} -> ${nextState}`);
            setState(nextState);
        }
    }, [state, context]);

    return {
        state,
        context,
        send
    };
};
