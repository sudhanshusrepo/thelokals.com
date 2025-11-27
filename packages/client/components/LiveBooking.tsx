
import React, { useState, useEffect } from 'react';
import { liveBookingService } from '../../core/services/liveBookingService';
import { useAuth } from '../contexts/AuthContext';
import { LiveBooking as LiveBookingType } from '../../core/types';
import { RealtimeChannel } from '@supabase/supabase-js';

const LiveBooking: React.FC = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState('');
  const [location, setLocation] = useState({ lat: '', lng: '' });
  const [requirements, setRequirements] = useState('');
  const [booking, setBooking] = useState<LiveBookingType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  let channel: RealtimeChannel | null = null;

  useEffect(() => {
    if (booking) {
      channel = liveBookingService.subscribeToBookingUpdates(booking.id, (payload) => {
        const updatedBooking = payload.new as LivetimeBookingType;
        setBooking(updatedBooking);

        if (updatedBooking.status === 'CONFIRMED' || updatedBooking.status === 'EXPIRED') {
          if (channel) {
            liveBookingService.unsubscribeFromChannel(channel);
          }
        }
      });
    }

    return () => {
      if (channel) {
        liveBookingService.unsubscribeFromChannel(channel);
      }
    };
  }, [booking?.id]);

  const handleCreateBooking = async () => {
    if (!user) {
      setError('You must be logged in to create a booking.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newBooking = await liveBookingService.createLiveBooking({
        clientId: user.id,
        serviceId,
        status: 'REQUESTED', // This is set on the backend, but good to have client-side
        requirements: {
          location: { lat: parseFloat(location.lat), lng: parseFloat(location.lng) },
          description: requirements,
        },
      });
      setBooking(newBooking);
      setStep(3); // Move to the finding providers step
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2>Step 1: Select Service</h2>
            <input
              type="text"
              placeholder="Enter Service ID"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
            />
            <button onClick={() => setStep(2)} disabled={!serviceId}>Next</button>
          </div>
        );
      case 2:
        return (
          <div>
            <h2>Step 2: Specify Location & Requirements</h2>
            <input
              type="text"
              placeholder="Latitude"
              value={location.lat}
              onChange={(e) => setLocation({ ...location, lat: e.target.value })}
            />
            <input
              type="text"
              placeholder="Longitude"
              value={location.lng}
              onChange={(e) => setLocation({ ...location, lng: e.target.value })}
            />
            <textarea
              placeholder="Describe your requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
            ></textarea>
            <button onClick={handleCreateBooking} disabled={!location.lat || !location.lng || loading}>
              {loading ? 'Finding Providers...' : 'Find Providers'}
            </button>
            <button onClick={() => setStep(1)} disabled={loading}>Previous</button>
          </div>
        );
      case 3:
        if (!booking) return null;
        return (
          <div>
            <h2>Finding a Provider...</h2>
            <p>Booking ID: {booking.id}</p>
            <p>Status: {booking.status}</p>
            {booking.status === 'CONFIRMED' && <p>A provider is on their way!</p>}
            {booking.status === 'EXPIRED' && <p>Sorry, no providers were available. Please try again later.</p>}
            {booking.status === 'REQUESTED' && <div className="loader"></div>}
          </div>
        );
      default:
        return <div>Unknown Step</div>;
    }
  };

  return (
    <div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {renderStep()}
    </div>
  );
};

export default LiveBooking;
