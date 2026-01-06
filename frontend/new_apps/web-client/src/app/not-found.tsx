import Link from 'next/link';
import { designTokensV2 } from '../theme/design-tokens-v2';
import { Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-gray-200 mb-4">404</h1>
                <h2 className="text-2xl font-bold text-v2-text-primary mb-2">Page Not Found</h2>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-v2-btn font-bold text-white shadow-lg hover:opacity-90 transition-opacity"
                    style={{ background: designTokensV2.colors.gradient.css, color: designTokensV2.colors.text.primary }}
                >
                    <Home size={20} />
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
