import { AdminLayout } from '../../components/layout/AdminLayout';
import { Calendar } from 'lucide-react';

export default function Bookings() {
    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Bookings</h1>
                    <p className="text-sm text-text-secondary">View and manage service bookings.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-secondary">
                        <Calendar size={18} />
                        <span>Date Range</span>
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="text-center py-12 text-text-tertiary">
                    <p>Bookings table will be implemented here.</p>
                </div>
            </div>
        </AdminLayout>
    );
}
