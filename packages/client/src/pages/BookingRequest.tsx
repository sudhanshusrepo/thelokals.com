import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VoiceInput } from '../components/VoiceInput';
import { unifiedBookingService } from '@thelocals/core/services/unifiedBookingService';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../hooks/useLocation';

export const BookingRequest: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { location, error: locationError } = useLocation();

    const [textInput, setTextInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string>('');

    const handleSubmit = async (text: string, method: 'voice' | 'text') => {
        if (!text.trim()) return;

        setLoading(true);
        setError('');

        try {
            const response = await unifiedBookingService.createRequest({
                userId: user!.id,
                input: text,
                inputMethod: method,
                location: location || undefined,
            });

            setResult(response);

            // Auto-navigate to matching phase after 3 seconds
            setTimeout(() => {
                navigate(`/booking/${response.bookingId}/matching`);
            }, 3000);
        } catch (err: any) {
            console.error('Booking request failed:', err);
            setError(err.message || 'Failed to create booking request');
        } finally {
            setLoading(false);
        }
    };

    const handleVoiceTranscript = (text: string) => {
        handleSubmit(text, 'voice');
    };

    const handleTextSubmit = () => {
        handleSubmit(textInput, 'text');
    };

    return (
        <div className="booking-request-page">
            <div className="container">
                <h1 className="title">What do you need help with?</h1>
                <p className="subtitle">Tell us in your own words, we'll handle the rest</p>

                {/* Voice Input */}
                <div className="input-section">
                    <VoiceInput
                        onTranscript={handleVoiceTranscript}
                        onError={(err) => setError(err.message)}
                    />
                </div>

                {/* Divider */}
                <div className="divider">
                    <span>OR</span>
                </div>

                {/* Text Input */}
                <div className="input-section">
                    <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Type what you need... (e.g., 'I need someone to clean my apartment' or 'Help with tax filing')"
                        rows={4}
                        className="text-input"
                        disabled={loading}
                    />
                    <button
                        onClick={handleTextSubmit}
                        disabled={!textInput.trim() || loading}
                        className="submit-button"
                    >
                        {loading ? 'Processing...' : 'Submit Request'}
                    </button>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="error-message">
                        ⚠️ {error}
                    </div>
                )}

                {/* Result Display */}
                {result && (
                    <div className="result-card">
                        <div className="result-header">
                            <div className="success-icon">✅</div>
                            <h2>Request Submitted!</h2>
                        </div>

                        <div className="result-details">
                            <div className="detail-row">
                                <span className="label">Service:</span>
                                <span className="value">{result.serviceCategory.replace('_', ' ')}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Type:</span>
                                <span className="value badge">{result.serviceMode}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Estimated Price:</span>
                                <span className="value price">₹{result.estimatedPrice.min} - ₹{result.estimatedPrice.max}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Duration:</span>
                                <span className="value">{result.estimatedDuration.min}-{result.estimatedDuration.max} mins</span>
                            </div>
                        </div>

                        <div className="loading-section">
                            <div className="spinner-large">⏳</div>
                            <p className="loading-text">Finding providers near you...</p>
                            <p className="loading-subtext">Please wait 30-40 seconds</p>
                        </div>
                    </div>
                )}

                {/* Location Warning */}
                {locationError && (
                    <div className="info-message">
                        📍 Location access denied. We'll ask for your address later.
                    </div>
                )}
            </div>

            <style>{`
        .booking-request-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem 1rem;
        }

        .container {
          max-width: 600px;
          margin: 0 auto;
        }

        .title {
          font-size: 2rem;
          font-weight: bold;
          color: white;
          text-align: center;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.9);
          text-align: center;
          margin-bottom: 2rem;
        }

        .input-section {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .divider {
          text-align: center;
          position: relative;
          margin: 2rem 0;
        }

        .divider::before,
        .divider::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 40%;
          height: 1px;
          background: rgba(255, 255, 255, 0.3);
        }

        .divider::before { left: 0; }
        .divider::after { right: 0; }

        .divider span {
          color: white;
          background: transparent;
          padding: 0 1rem;
          font-weight: 600;
        }

        .text-input {
          width: 100%;
          padding: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          resize: vertical;
          font-family: inherit;
          transition: border-color 0.3s;
        }

        .text-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .text-input:disabled {
          background: #f9fafb;
          cursor: not-allowed;
        }

        .submit-button {
          width: 100%;
          margin-top: 1rem;
          padding: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          background: #fee2e2;
          color: #991b1b;
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1rem;
          text-align: center;
        }

        .info-message {
          background: #dbeafe;
          color: #1e40af;
          padding: 1rem;
          border-radius: 12px;
          margin-top: 1rem;
          text-align: center;
          font-size: 0.875rem;
        }

        .result-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .result-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .success-icon {
          font-size: 3rem;
          margin-bottom: 0.5rem;
        }

        .result-header h2 {
          font-size: 1.5rem;
          color: #1f2937;
          margin: 0;
        }

        .result-details {
          background: #f9fafb;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .value {
          font-size: 1rem;
          color: #1f2937;
          font-weight: 600;
        }

        .value.price {
          color: #059669;
        }

        .badge {
          background: #dbeafe;
          color: #1e40af;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          text-transform: capitalize;
        }

        .loading-section {
          text-align: center;
          padding: 2rem 0;
        }

        .spinner-large {
          font-size: 3rem;
          animation: spin 2s linear infinite;
        }

        .loading-text {
          font-size: 1.125rem;
          color: #1f2937;
          font-weight: 600;
          margin: 1rem 0 0.5rem;
        }

        .loading-subtext {
          font-size: 0.875rem;
          color: #6b7280;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};
