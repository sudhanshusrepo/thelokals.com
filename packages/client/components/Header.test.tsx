import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from './Header';
import '@testing-library/jest-dom';

// Mock supabase
jest.mock('../../core/services/supabase', () => ({
    supabase: {
        auth: {
            getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
            onAuthStateChange: jest.fn(() => ({
                data: { subscription: { unsubscribe: jest.fn() } }
            })),
            signOut: jest.fn(),
        },
    },
}));

describe('Header', () => {
    const mockOnSignInClick = jest.fn();
    const mockOnSearch = jest.fn();

    it('should render the logo and brand name on home page', () => {
        render(
            <BrowserRouter>
                <Header
                    isHome={true}
                    title="Thelokals.com"
                    onSignInClick={mockOnSignInClick}
                    onSearch={mockOnSearch}
                />
            </BrowserRouter>
        );

        expect(screen.getByText('thelokals.com')).toBeInTheDocument();
        expect(screen.getByAltText('thelokals logo')).toBeInTheDocument();
    });

    it('should render back button when not on home page', () => {
        render(
            <BrowserRouter>
                <Header
                    isHome={false}
                    title="Services"
                    onSignInClick={mockOnSignInClick}
                    onSearch={mockOnSearch}
                />
            </BrowserRouter>
        );

        expect(screen.getByText('Back')).toBeInTheDocument();
    });

    it('should render sign in button when user is not logged in', () => {
        render(
            <BrowserRouter>
                <Header
                    isHome={true}
                    title="Thelokals.com"
                    onSignInClick={mockOnSignInClick}
                    onSearch={mockOnSearch}
                />
            </BrowserRouter>
        );

        expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
});
