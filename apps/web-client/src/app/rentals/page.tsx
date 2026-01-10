'use client';
import { RentalBookingWizard } from '../../components/booking/RentalBookingWizard';

export default function RentalPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-md mx-auto h-screen bg-white shadow-xl overflow-hidden">
                <RentalBookingWizard />
            </div>
        </div>
    );
}
