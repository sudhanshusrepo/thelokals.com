import React from 'react';
import { render, screen } from '@testing-library/react';
import { HowItWorks } from './HowItWorks';
import '@testing-library/jest-dom';

describe('HowItWorks', () => {
    it('should render the component title', () => {
        render(<HowItWorks />);
        expect(screen.getByText('How It Works')).toBeInTheDocument();
    });

    it('should render all three steps', () => {
        render(<HowItWorks />);
        expect(screen.getByText('Search')).toBeInTheDocument();
        expect(screen.getByText('Book')).toBeInTheDocument();
        expect(screen.getByText('Relax')).toBeInTheDocument();
    });

    it('should render step descriptions', () => {
        render(<HowItWorks />);
        expect(screen.getByText(/Find the service you need/i)).toBeInTheDocument();
        expect(screen.getByText(/Choose a professional/i)).toBeInTheDocument();
        expect(screen.getByText(/Sit back while our verified experts/i)).toBeInTheDocument();
    });
});
