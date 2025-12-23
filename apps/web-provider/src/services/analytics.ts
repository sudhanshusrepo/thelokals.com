// Analytics tracking for provider app
// Integrate with Google Analytics, Mixpanel, or custom analytics

interface AnalyticsEvent {
    event: string;
    properties?: Record<string, any>;
    userId?: string;
}

class AnalyticsService {
    private userId: string | null = null;

    setUser(userId: string) {
        this.userId = userId;
    }

    track(event: string, properties?: Record<string, any>) {
        const eventData: AnalyticsEvent = {
            event,
            properties: {
                ...properties,
                timestamp: new Date().toISOString(),
                userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'
            },
            userId: this.userId || undefined
        };

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log('[Analytics]', eventData);
        }

        // Send to analytics service
        this.sendToAnalytics(eventData);
    }

    private async sendToAnalytics(event: AnalyticsEvent) {
        try {
            // TODO: Implement actual analytics integration
            // Example: Google Analytics
            // if (typeof window !== 'undefined' && window.gtag) {
            //   window.gtag('event', event.event, event.properties);
            // }

            // Example: Custom endpoint
            // await fetch('/api/analytics', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(event)
            // });
        } catch (error) {
            console.error('Failed to send analytics:', error);
        }
    }

    // Onboarding funnel tracking
    trackOnboardingStarted(userId: string) {
        this.setUser(userId);
        this.track('onboarding_started', { step: 0 });
    }

    trackOnboardingStepCompleted(step: number, stepName: string) {
        this.track('onboarding_step_completed', { step, stepName });
    }

    trackOnboardingCompleted(duration: number) {
        this.track('onboarding_completed', { duration });
    }

    trackOnboardingAbandoned(step: number, stepName: string) {
        this.track('onboarding_abandoned', { step, stepName });
    }

    // Document upload tracking
    trackDocumentUploaded(documentType: string, fileSize: number) {
        this.track('document_uploaded', { documentType, fileSize });
    }

    trackDocumentUploadFailed(documentType: string, error: string) {
        this.track('document_upload_failed', { documentType, error });
    }

    // Approval tracking
    trackApprovalReceived(status: 'approved' | 'rejected', timeToApproval: number) {
        this.track('approval_received', { status, timeToApproval });
    }

    // Booking tracking
    trackBookingRequestReceived(bookingId: string) {
        this.track('booking_request_received', { bookingId });
    }

    trackBookingAccepted(bookingId: string) {
        this.track('booking_accepted', { bookingId });
    }

    trackBookingRejected(bookingId: string, reason?: string) {
        this.track('booking_rejected', { bookingId, reason });
    }
}

export const analytics = new AnalyticsService();
