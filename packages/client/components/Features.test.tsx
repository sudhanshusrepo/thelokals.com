import React from 'react';
import { render, screen } from '@testing-library/react';
import { Features } from './Features';
import '@testing-library/jest-dom';

describe('Features', () => {
    it('should render the component title', () => {
        render(<Features />);
        expect(screen.getByText('Why Choose Us?')).toBeInTheDocument();
    });

    it('should render all four features', () => {
        render(<Features />);
        expect(screen.getByText('Verified Professionals')).toBeInTheDocument();
        expect(screen.getByText('Secure Payments')).toBeInTheDocument();
        expect(screen.getByText('24/7 Support')).toBeInTheDocument();
        expect(screen.getByText('Satisfaction Guarantee')).toBeInTheDocument();
    });

    it('should render feature descriptions', () => {
        render(<Features />);
        expect(screen.getByText(/Every expert is vetted/i)).toBeInTheDocument();
        expect(screen.getByText(/Pay safely through our platform/i)).toBeInTheDocument();
        expect(screen.getByText(/Our dedicated support team/i)).toBeInTheDocument();
        expect(screen.getByText(/Not happy/i)).toBeInTheDocument();
    });
});
