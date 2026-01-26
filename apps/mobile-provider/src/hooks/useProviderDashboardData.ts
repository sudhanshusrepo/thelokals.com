import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { providerService } from '@thelocals/platform-core';

export function useProviderDashboardData(userId: string | undefined) {
    const [stats, setStats] = useState({
        monthlyEarnings: 0,
        currentBalance: 0,
        activeJobs: 0,
        completedToday: 0,
        rating: 5.0,
        trend: 0
    });
    const [recentJobs, setRecentJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const fetchData = useCallback(async () => {
        if (!userId) return;

        // Don't set loading true on refresh to avoid screen flicker, only on initial load if needed
        // But for pull-to-refresh we might want a separate refreshing state. 
        // For now, simple fetch.

        try {
            const [statsData, jobsData] = await Promise.all([
                providerService.getDashboardStats(userId),
                providerService.getJobs(userId, ['CONFIRMED', 'EN_ROUTE', 'IN_PROGRESS'])
            ]);

            setStats(statsData || { monthlyEarnings: 0, currentBalance: 0, activeJobs: 0, completedToday: 0, rating: 5.0, trend: 0 });
            setRecentJobs(jobsData || []);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Refresh when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    return {
        stats,
        recentJobs,
        loading,
        error,
        refresh: fetchData
    };
}
