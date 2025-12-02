import React, { useEffect, useState } from 'react';
import { supabase } from '@thelocals/core/services/supabase';
import { JobRequestCard } from '../components/JobRequestCard';
import { useAuth } from '../../contexts/AuthContext';

export const JobRequests: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('booking_requests')
        .select(`
          id,
          status,
          created_at,
          booking:bookings (
            id,
            service_category,
            service_mode,
            estimated_price_min,
            estimated_price_max,
            estimated_duration_min,
            estimated_duration_max,
            location,
            address,
            urgency,
            created_at
          )
        `)
        .eq('provider_id', user.id)
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    // Real-time subscription
    const channel = supabase
      .channel('provider-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'booking_requests',
          filter: `provider_id=eq.${user?.id}`
        },
        () => {
          // Refresh on any change
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading) {
    return <div className="loading">Loading opportunities...</div>;
  }

  return (
    <div className="job-requests-page">
      <header className="page-header">
        <h1>New Opportunities</h1>
        <span className="count-badge">{requests.length}</span>
      </header>

      {requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No new requests</h3>
          <p>We'll notify you when jobs match your profile.</p>
        </div>
      ) : (
        <div className="requests-list">
          {requests.map(req => (
            <JobRequestCard
              key={req.id}
              request={req}
              providerId={user!.id}
              onAction={fetchRequests}
            />
          ))}
        </div>
      )}

      <style>{`
        .job-requests-page {
          padding: 1rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        h1 {
          font-size: 1.5rem;
          color: #111827;
          margin: 0;
        }

        .count-badge {
          background: #ef4444;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.875rem;
          font-weight: 700;
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          background: #f9fafb;
          border-radius: 12px;
          border: 2px dashed #e5e7eb;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: #6b7280;
        }

        .requests-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
      `}</style>
    </div>
  );
};
