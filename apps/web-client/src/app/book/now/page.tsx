'use client';
import { LiveRequestWizard } from '../../../components/booking/LiveRequestWizard';

export default function BookNowPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-md mx-auto h-screen bg-white shadow-xl overflow-hidden">
                <LiveRequestWizard />
            </div>
        </div>
    );
}
