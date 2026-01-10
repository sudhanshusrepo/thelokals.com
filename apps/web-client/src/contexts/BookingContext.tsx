'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { BookingFlow, BookingState, BookingContext as StateContext } from '@thelocals/flows';

interface BookingContextType {
    bookingState: BookingState;
    context: StateContext;
    send: (event: string, payload?: any) => void;
    startBooking: (data: Partial<StateContext>) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<BookingState>(BookingFlow.initialState);
    const [context, setContext] = useState<StateContext>({});

    const send = (event: string, payload?: any) => {
        console.log(`[BookingFlow] ${state} + ${event} -> ...`);

        // Update context if payload provided
        if (payload) {
            setContext(prev => ({ ...prev, ...payload }));
        }

        const nextState = BookingFlow.next(state, event, context);
        if (nextState !== state) {
            console.log(`[BookingFlow] ... -> ${nextState}`);
            setState(nextState);
        }
    };

    const startBooking = (data: Partial<StateContext>) => {
        send('START', data);
    };

    return (
        <BookingContext.Provider value={{ bookingState: state, context, send, startBooking }}>
            {children}
        </BookingContext.Provider>
    );
};

export const useBookingFlow = () => {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error('useBookingFlow must be used within a BookingProvider');
    }
    return context;
};

export const useBooking = () => {
    const { context, ...rest } = useBookingFlow();
    return { bookingData: context, ...rest };
};
