export interface MeetingConfig {
    provider: 'jitsi' | 'google_meet' | 'zoom' | 'custom';
    topic: string;
    startTime?: string;
    durationMinutes?: number;
}

export interface MeetingResponse {
    joinUrl: string;
    hostUrl?: string;
    provider: string;
    meetingId: string;
    password?: string;
}

export const meetingService = {
    /**
     * Generates a meeting link for an online booking.
     * Currently mocks the response with a Jitsi Meet link.
     */
    async generateMeetingLink(config: MeetingConfig): Promise<MeetingResponse> {
        // TODO: Integrate with real providers (Google Calendar API, Zoom API)

        const meetingId = `thelokals-${Math.random().toString(36).substring(7)}`;
        const sanitizedTopic = config.topic.replace(/[^a-zA-Z0-9]/g, '-');

        // Default to Jitsi for MVP as it requires no API keys
        const joinUrl = `https://meet.jit.si/${sanitizedTopic}-${meetingId}`;

        return {
            joinUrl,
            provider: config.provider,
            meetingId
        };
    }
};
