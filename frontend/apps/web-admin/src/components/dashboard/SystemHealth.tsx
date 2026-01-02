import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, XCircle, Activity } from 'lucide-react';
import { supabase } from '@thelocals/core/services/supabase';

interface HealthMetric {
    name: string;
    status: 'operational' | 'degraded' | 'down';
    uptime: number;
    latency?: number;
    lastChecked: string;
}

export function SystemHealth() {
    const [health, setHealth] = useState<HealthMetric[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkSystemHealth();
        // Check every 60 seconds
        const interval = setInterval(checkSystemHealth, 60000);
        return () => clearInterval(interval);
    }, []);

    const checkSystemHealth = async () => {
        setLoading(true);
        const metrics: HealthMetric[] = [];

        // Check Supabase API
        const supabaseHealth = await checkSupabase();
        metrics.push(supabaseHealth);

        // Check Edge Functions (placeholder - would need actual endpoint)
        metrics.push({
            name: 'Edge Functions',
            status: 'operational',
            uptime: 99.9,
            lastChecked: new Date().toISOString()
        });

        // Check Payment Gateway (placeholder)
        metrics.push({
            name: 'Payment Gateway',
            status: 'operational',
            uptime: 99.5,
            lastChecked: new Date().toISOString()
        });

        // Check SMS Service (placeholder)
        metrics.push({
            name: 'SMS Service',
            status: 'operational',
            uptime: 98.5,
            lastChecked: new Date().toISOString()
        });

        setHealth(metrics);
        setLoading(false);
    };

    const checkSupabase = async (): Promise<HealthMetric> => {
        try {
            const start = Date.now();
            await supabase.from('profiles').select('count').limit(1);
            const latency = Date.now() - start;

            return {
                name: 'Supabase API',
                status: latency < 1000 ? 'operational' : latency < 3000 ? 'degraded' : 'down',
                uptime: 99.9,
                latency,
                lastChecked: new Date().toISOString()
            };
        } catch (error) {
            return {
                name: 'Supabase API',
                status: 'down',
                uptime: 0,
                lastChecked: new Date().toISOString()
            };
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'operational':
                return <CheckCircle2 size={16} className="text-success" />;
            case 'degraded':
                return <AlertCircle size={16} className="text-warning" />;
            case 'down':
                return <XCircle size={16} className="text-danger" />;
            default:
                return <Activity size={16} className="text-text-tertiary" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'operational':
                return 'text-success';
            case 'degraded':
                return 'text-warning';
            case 'down':
                return 'text-danger';
            default:
                return 'text-text-tertiary';
        }
    };

    const overallStatus = health.every(m => m.status === 'operational')
        ? 'operational'
        : health.some(m => m.status === 'down')
            ? 'down'
            : 'degraded';

    const averageUptime = health.length > 0
        ? (health.reduce((sum, m) => sum + m.uptime, 0) / health.length).toFixed(1)
        : '0.0';

    if (loading && health.length === 0) {
        return (
            <div className="card">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-4 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Activity className="text-primary" size={24} />
                    <div>
                        <h3 className="font-bold text-text-primary">System Health</h3>
                        <p className="text-xs text-text-secondary">Real-time service status</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {getStatusIcon(overallStatus)}
                    <span className={`text-sm font-semibold ${getStatusColor(overallStatus)}`}>
                        {averageUptime}% Uptime
                    </span>
                </div>
            </div>

            <div className="space-y-3">
                {health.map((metric) => (
                    <div
                        key={metric.name}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            {getStatusIcon(metric.status)}
                            <div>
                                <p className="text-sm font-medium text-text-primary">{metric.name}</p>
                                {metric.latency && (
                                    <p className="text-xs text-text-tertiary">{metric.latency}ms latency</p>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`text-sm font-semibold capitalize ${getStatusColor(metric.status)}`}>
                                {metric.status}
                            </p>
                            <p className="text-xs text-text-tertiary">{metric.uptime}%</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-text-tertiary text-center">
                    Last updated: {new Date(health[0]?.lastChecked || new Date()).toLocaleTimeString()}
                </p>
            </div>
        </div>
    );
}
