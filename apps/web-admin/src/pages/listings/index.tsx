import { AdminLayout } from '../../components/layout/AdminLayout';
import { Plus, Filter } from 'lucide-react';

export default function Listings() {
    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Listings</h1>
                    <p className="text-sm text-text-secondary">Manage service listings and catalogs.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-secondary">
                        <Filter size={18} />
                        <span>Filter</span>
                    </button>
                    <button className="btn-primary">
                        <Plus size={18} />
                        <span>Add Listing</span>
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="text-center py-12 text-text-tertiary">
                    <p>Listings management table will be implemented here.</p>
                </div>
            </div>
        </AdminLayout>
    );
}
