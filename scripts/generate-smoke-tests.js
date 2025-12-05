const fs = require('fs');
const path = require('path');

const dirs = [
    path.join(__dirname, '../packages/client/components'),
    path.join(__dirname, '../packages/provider/components')
];

const template = (componentName, importPath) => `
import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ${componentName} } from './${componentName}';
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

describe('${componentName}', () => {
    it('renders without crashing', () => {
        render(
            <BrowserRouter>
                <${componentName} />
            </BrowserRouter>
        );
    });
});
`;

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    files.forEach(file => {
        if (file.endsWith('.tsx') && !file.includes('.test.') && !file.includes('.spec.')) {
            const componentName = path.basename(file, '.tsx');
            const testFile = path.join(dir, `${componentName}.smoke.test.tsx`);

            if (!fs.existsSync(testFile) && !fs.existsSync(path.join(dir, `${componentName}.test.tsx`))) {
                console.log(`Generating smoke test for ${componentName}...`);
                fs.writeFileSync(testFile, template(componentName, file));
            }
        }
    });
});

console.log('Smoke test generation complete.');
