
import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ReviewModal } from './ReviewModal';
import '@testing-library/jest-dom';

// Mock Supabase
jest.mock('../../core/services/supabase', () => ({
    supabase: {
        auth: {
            getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
            onAuthStateChange: jest.fn(() => ({
                data: { subscription: { unsubscribe: jest.fn() } }
            })),
            signOut: jest.fn(),
        },
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
        })),
    },
}));

// Mock Contexts
jest.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({ user: null, loading: false, signOut: jest.fn() }),
}));

jest.mock('../contexts/ToastContext', () => ({
    useToast: () => ({ showToast: jest.fn() }),
}));

describe('ReviewModal', () => {
    it('renders without crashing', () => {
        render(
            <BrowserRouter>
                <ReviewModal />
            </BrowserRouter>
        );
    });
});
