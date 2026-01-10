import { useState } from 'react';
import { AuthState, AuthFlow } from '@thelocals/flows';

export function useAuthFlow() {
    const [state, setState] = useState<AuthState>(AuthFlow.initialState);

    const transition = (event: string, context?: any) => {
        const nextState = AuthFlow.next(state, event, context);
        setState(nextState);
    };

    return { state, transition };
}
