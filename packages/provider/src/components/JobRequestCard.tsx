import React, { useState } from 'react';
import { matchingService } from '@thelocals/core/services/matchingService';

interface JobRequestCardProps {
    request: {
        id: string;
        status: string;
        booking: {
            id: string;
            service_category: string;
            service_mode: 'local' | 'online';
            estimated_price_min: number;
            estimated_price_max: number;
            estimated_duration_min: number;
            estimated_duration_max: number;
            location: string | null; // PostGIS point string or null
            address: any;
            urgency: string;
            created_at: string;
        };
    };
    providerId: string;
    onAction: () => void; // Callback to refresh list
}

export const JobRequestCard: React.FC<JobRequestCardProps> = ({ request, providerId, onAction }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { booking } = request;
    const isUrgent = booking.urgency === 'high' || booking.urgency === 'emergency';

    const handleAccept = async () => {
        setLoading(true);
        setError(null);
        try {
            const success = await matchingService.acceptBooking(booking.id, providerId);
            if (success) {
                alert('Booking accepted! Check your active jobs.');
                onAction();
            } else {
                setError('This job is no longer available.');
                onAction(); // Refresh to remove stale request
            }
        } catch (err: any) {
            console.error('Accept error:', err);
            setError(err.message || 'Failed to accept booking');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        setLoading(true);
        try {
            await matchingService.rejectBooking(booking.id, providerId);
            onAction();
        } catch (err) {
            console.error('Reject error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`job-card ${isUrgent ? 'urgent' : ''}`}>
            <div className="card-header">
                <div className="service-info">
                    <h3 className="service-title">
                        {booking.service_category.replace(/_/g, ' ')}
                    </h3>
                    <span className={`badge ${booking.service_mode}`}>
                        {booking.service_mode}
                    </span>
                    {isUrgent && <span className="badge urgent">URGENT</span>}
                </div>
                <div className="price-tag">
                    ₹{booking.estimated_price_min} - ₹{booking.estimated_price_max}
                </div>
            </div>

            <div className="card-body">
                <div className="detail-row">
                    <span className="icon">⏱️</span>
                    <span>{booking.estimated_duration_min}-{booking.estimated_duration_max} mins</span>
                </div>

                {booking.service_mode === 'local' && booking.address && (
                    <div className="detail-row">
                        <span className="icon">📍</span>
                        <span>{booking.address.city || 'Local Area'}</span>
                    </div>
                )}

                <div className="detail-row">
                    <span className="icon">📅</span>
                    <span>As soon as possible</span>
                </div>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <div className="card-actions">
                <button
                    className="btn-reject"
                    onClick={handleReject}
                    disabled={loading}
                >
                    Reject
                </button>
                <button
                    className="btn-accept"
                    onClick={handleAccept}
                    disabled={loading}
                >
                    {loading ? 'Accepting...' : 'Accept Job'}
                </button>
            </div>

            <style>{`
        .job-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          border: 1px solid #e5e7eb;
          transition: transform 0.2s;
          margin-bottom: 1rem;
        }

        .job-card.urgent {
          border-left: 4px solid #ef4444;
          background: #fff5f5;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .service-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          text-transform: capitalize;
          margin: 0 0 0.5rem 0;
        }

        .service-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          width: fit-content;
        }

        .badge.local { background: #dbeafe; color: #1e40af; }
        .badge.online { background: #e0e7ff; color: #4338ca; }
        .badge.urgent { background: #fee2e2; color: #991b1b; }

        .price-tag {
          font-size: 1rem;
          font-weight: 700;
          color: #059669;
          background: #ecfdf5;
          padding: 0.5rem;
          border-radius: 8px;
        }

        .card-body {
          margin-bottom: 1.5rem;
        }

        .detail-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #4b5563;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .error-msg {
          color: #dc2626;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          text-align: center;
        }

        .card-actions {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 1rem;
        }

        button {
          padding: 0.75rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: opacity 0.2s;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-reject {
          background: #f3f4f6;
          color: #4b5563;
        }

        .btn-reject:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .btn-accept {
          background: #2563eb;
          color: white;
        }

        .btn-accept:hover:not(:disabled) {
          background: #1d4ed8;
        }
      `}</style>
        </div>
    );
};
