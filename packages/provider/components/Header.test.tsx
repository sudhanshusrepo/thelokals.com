import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from './Header';
import '@testing-library/jest-dom';

describe('Provider Header', () => {
    it('should render the logo and brand name', () => {
        render(
            <BrowserRouter>
                <Header title="Registration" showAutoSaving={true} />
            </BrowserRouter>
        );

        expect(screen.getByText('thelokals.com')).toBeInTheDocument();
        expect(screen.getByAltText('The Lokals Logo')).toBeInTheDocument();
    });

    it('should render the title', () => {
        render(
            <BrowserRouter>
                <Header title="Registration" showAutoSaving={true} />
            </BrowserRouter>
        );

        expect(screen.getByText('Registration')).toBeInTheDocument();
    });

    it('should render auto-saving indicator when enabled', () => {
        render(
            <BrowserRouter>
                <Header title="Registration" showAutoSaving={true} />
            </BrowserRouter>
        );

        expect(screen.getByText('Auto-saving')).toBeInTheDocument();
    });

    it('should not render auto-saving indicator when disabled', () => {
        render(
            <BrowserRouter>
                <Header title="Registration" showAutoSaving={false} />
            </BrowserRouter>
        );

        expect(screen.queryByText('Auto-saving')).not.toBeInTheDocument();
    });
});
