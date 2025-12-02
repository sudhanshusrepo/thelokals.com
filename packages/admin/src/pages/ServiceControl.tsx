import React, { useEffect, useState } from 'react';
import { adminService } from '@thelocals/core/services/adminService';
import { supabase } from '@thelocals/core/services/supabase';
import { ServiceAvailability } from '@thelocals/core/types';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

interface ServiceCategory {
    id: string;
    name: string;
    type: 'local' | 'online';
}

export const ServiceControl: React.FC = () => {
    const { adminUser } = useAuth();
    const [services, setServices] = useState<ServiceCategory[]>([]);
    const [availability, setAvailability] = useState<ServiceAvailability[]>([]);
    const [selectedCity, setSelectedCity] = useState('');
    const [cities, setCities] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (selectedCity) {
            loadAvailability();
        }
    }, [selectedCity]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load service categories
            const { data: servicesData, error: servicesError } = await supabase
                .from('service_categories')
                .select('id, name, type')
                .order('name');

            if (servicesError) throw servicesError;
            setServices(servicesData || []);

            // Load unique cities from bookings or a cities table
            const { data: citiesData } = await supabase
                .from('bookings')
                .select('address->city')
                .limit(1000);

            const uniqueCities = [...new Set(
                citiesData?.map((b: any) => b.city).filter(Boolean) || []
            )].sort();
            setCities(uniqueCities as string[]);

        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadAvailability = async () => {
        try {
            const data = await adminService.getServiceAvailability({ city: selectedCity });
            setAvailability(data);
        } catch (error) {
            console.error('Failed to load availability:', error);
        }
    };

    const getServiceStatus = (serviceId: string): 'ENABLED' | 'DISABLED' => {
        const record = availability.find(
            a => a.service_category_id === serviceId && a.location_value === selectedCity
        );
        return record?.status || 'ENABLED'; // Default to enabled
    };

    const toggleService = async (serviceId: string, serviceName: string) => {
        if (!adminUser || !selectedCity) return;

        const currentStatus = getServiceStatus(serviceId);
        const newStatus = currentStatus === 'ENABLED' ? 'DISABLED' : 'ENABLED';

        const reason = newStatus === 'DISABLED'
            ? prompt(`Reason for disabling ${serviceName} in ${selectedCity}:`)
            : null;

        if (newStatus === 'DISABLED' && !reason) return; // Cancelled

        try {
            await adminService.toggleServiceAvailability(
                serviceId,
                selectedCity,
                newStatus,
                adminUser.id,
                reason || undefined
            );

            // Reload availability
            await loadAvailability();

            alert(`${serviceName} ${newStatus.toLowerCase()} in ${selectedCity}`);
        } catch (error) {
            console.error('Failed to toggle service:', error);
            alert('Failed to update service availability');
        }
    };

    const bulkToggle = async (type: 'local' | 'online', status: 'ENABLED' | 'DISABLED') => {
        if (!adminUser || !selectedCity) return;

        const serviceIds = services
            .filter(s => s.type === type)
            .map(s => s.id);

        const reason = status === 'DISABLED'
            ? prompt(`Reason for bulk ${status.toLowerCase()} ${type} services in ${selectedCity}:`)
            : null;

        if (status === 'DISABLED' && !reason) return;

        try {
            await adminService.bulkToggleServices(
                serviceIds,
                selectedCity,
                status,
                adminUser.id,
                reason || undefined
            );

            await loadAvailability();
            alert(`Bulk ${status.toLowerCase()} ${type} services in ${selectedCity}`);
        } catch (error) {
            console.error('Failed to bulk toggle:', error);
            alert('Failed to bulk update services');
        }
    };

    const localServices = services.filter(s => s.type === 'local');
    const onlineServices = services.filter(s => s.type === 'online');

    return (
        <Layout>
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Service Control</h1>
                    <p className="text-gray-600 mt-2">
                        Enable or disable services by location for phased rollouts and operational control
                    </p>
                </div>

                {/* City Selection */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select City
                    </label>
                    <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">-- Select a city --</option>
                        {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>

                {selectedCity && (
                    <>
                        {/* Bulk Actions */}
                        <div className="bg-white rounded-lg shadow p-6 mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bulk Actions</h2>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => bulkToggle('local', 'DISABLED')}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Disable All Local Services
                                </button>
                                <button
                                    onClick={() => bulkToggle('local', 'ENABLED')}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Enable All Local Services
                                </button>
                                <button
                                    onClick={() => bulkToggle('online', 'DISABLED')}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Disable All Online Services
                                </button>
                                <button
                                    onClick={() => bulkToggle('online', 'ENABLED')}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Enable All Online Services
                                </button>
                            </div>
                        </div>

                        {/* Local Services */}
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Local Services ({localServices.length})
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {localServices.map(service => (
                                    <ServiceCard
                                        key={service.id}
                                        service={service}
                                        status={getServiceStatus(service.id)}
                                        onToggle={() => toggleService(service.id, service.name)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Online Services */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Online Services ({onlineServices.length})
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {onlineServices.map(service => (
                                    <ServiceCard
                                        key={service.id}
                                        service={service}
                                        status={getServiceStatus(service.id)}
                                        onToggle={() => toggleService(service.id, service.name)}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {!selectedCity && !loading && (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <p className="text-gray-500">Please select a city to manage service availability</p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

interface ServiceCardProps {
    service: ServiceCategory;
    status: 'ENABLED' | 'DISABLED';
    onToggle: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, status, onToggle }) => {
    const isEnabled = status === 'ENABLED';

    return (
        <div className="bg-white rounded-lg shadow p-4 border-l-4" style={{
            borderLeftColor: isEnabled ? '#10b981' : '#ef4444'
        }}>
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <p className="text-xs text-gray-500 capitalize">{service.type}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>

            <button
                onClick={onToggle}
                className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${isEnabled
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
            >
                {isEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
        </div>
    );
};
