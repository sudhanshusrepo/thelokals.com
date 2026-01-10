import { ServiceCategory, ServiceLocation } from "@thelocals/platform-core";
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Edit2, Trash2, Power } from 'lucide-react';

interface ServiceCategoryTableProps {
    categories: ServiceCategory[];
    locations: ServiceLocation[];
    loading: boolean;
    selectedCity: string;
    onEdit: (cat: ServiceCategory) => void;
    onDelete: (id: string) => void;
    onToggleStatus: (cat: ServiceCategory) => void;
}

export function ServiceCategoryTable({
    categories,
    locations,
    loading,
    selectedCity,
    onEdit,
    onDelete,
    onToggleStatus
}: ServiceCategoryTableProps) {
    if (loading) {
        return (
            <Card className="min-h-[200px] flex items-center justify-center">
                <span className="text-neutral-500">Loading catalogue...</span>
            </Card>
        );
    }

    if (categories.length === 0) {
        return (
            <Card className="min-h-[200px] flex items-center justify-center">
                <span className="text-neutral-500">No services found. Add one to get started.</span>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-neutral-50 border-b border-neutral-100">
                        <tr>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Name</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Type</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Base Price</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status ({selectedCity})</th>
                            <th className="text-right py-3 px-6 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {categories.map((cat) => {
                            const locConfig = locations.find(l => l.service_category_id === cat.id);
                            const isEnabled = locConfig?.is_active || false;

                            return (
                                <tr key={cat.id} className="hover:bg-neutral-50/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div>
                                            <span className="font-medium text-neutral-900 block">{cat.name}</span>
                                            <span className="text-xs text-neutral-400 max-w-xs block truncate">{cat.description}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <Badge variant={cat.type === 'SERVICE' ? 'success' : 'info'}>
                                            {cat.type?.toUpperCase() || 'UNKNOWN'}
                                        </Badge>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="font-medium text-neutral-900">
                                            ₹{cat.base_price || 499}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <button
                                            onClick={() => onToggleStatus(cat)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${isEnabled
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                                                }`}
                                        >
                                            <Power size={12} className={isEnabled ? "text-green-600" : "text-neutral-400"} />
                                            {isEnabled ? 'Active' : 'Disabled'}
                                        </button>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex justify-end gap-2">
                                            <a
                                                href={`/listings/${cat.id}/items`}
                                                className="px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors mr-2"
                                            >
                                                Manage Items
                                            </a>
                                            <button
                                                onClick={() => onEdit(cat)}
                                                className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-primary transition-colors"
                                                title="Edit Service"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(cat.id)}
                                                className="p-1.5 hover:bg-red-50 rounded-lg text-neutral-400 hover:text-red-600 transition-colors"
                                                title="Delete Service"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
