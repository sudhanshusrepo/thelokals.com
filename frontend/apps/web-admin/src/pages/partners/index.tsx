import { AdminLayout } from '../../components/layout/AdminLayout';
import { Plus, Download } from 'lucide-react';

export default function Partners() {
    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Partners</h1>
                    <p className="text-sm text-text-secondary">Onboard and manage service providers.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-secondary">
                        <Download size={18} />
                        <span>Export</span>
                    </button>
                    <button className="btn-primary">
                        <Plus size={18} />
                        <span>Onboard Partner</span>
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="text-center py-12 text-text-tertiary">
                    <p>Partner management table will be implemented here.</p>
                </div>
            </div>
        </AdminLayout>
    );
}
