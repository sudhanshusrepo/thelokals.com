// AI Classification Service - currently using fallback only

export interface ClassificationResult {
    serviceCategory: string; // Friendly name
    serviceCode: string; // db code like 'ac_repair'
    serviceMode: 'local' | 'online';
    urgency: 'low' | 'normal' | 'high' | 'emergency';
    estimatedDuration: { min: number; max: number }; // minutes
    suggestedQuestions: string[];
    confidence: number; // 0-1
}

/**
 * AI Classification Service using Gemini
 */
export const aiClassificationService = {
    /**
     * Classify service request using Gemini
     */
    async classifyRequest(
        input: string,
        location?: { lat: number; lng: number }
    ): Promise<ClassificationResult> {
        const prompt = `
You are a service classification AI for thelokals.com, a platform connecting customers with service providers in India.

Customer request: "${input}"
${location ? `Customer location: ${location.lat}, ${location.lng}` : ''}

Analyze this request and provide:
1. Service category (Friendly display name)
2. Service code (use snake_case: cleaning, plumbing, tax_consulting, web_development, ac_repair, etc.)
3. Service mode: "local" (physical, on-location) or "online" (remote, digital)
4. Urgency level: 
   - "low": Can wait days/weeks
   - "normal": Within 1-2 days
   - "high": Same day needed
   - "emergency": Immediate (water leak, electrical issue, etc.)
5. Estimated duration range in minutes (min and max)
6. 2-3 clarifying questions to ask the customer
7. Confidence score (0-1)

Examples:
- "My sink is leaking" → Plumbing, plumbing, local, high urgency
- "Need tax filing help" → Tax Consulting, tax_consulting, online, normal urgency

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "serviceCategory": "string",
  "serviceCode": "string",
  "serviceMode": "local" | "online",
  "urgency": "low" | "normal" | "high" | "emergency",
  "estimatedDuration": { "min": number, "max": number },
  "suggestedQuestions": ["question1", "question2"],
  "confidence": number
}
`;

        try {
            // const response = await geminiService.generateContent(prompt);

            // // Extract JSON from response
            // const jsonMatch = response.match(/\{[\s\S]*\}/);
            // if (!jsonMatch) {
            //     throw new Error('Invalid AI response format');
            // }

            // const result = JSON.parse(jsonMatch[0]) as ClassificationResult;

            // // Validate result
            // if (!result.serviceCategory || !result.serviceMode) {
            //     throw new Error('Incomplete classification result');
            // }

            // return result;
            throw new Error('AI classification not yet implemented');
        } catch (error) {
            console.error('Classification error:', error);

            // Fallback classification
            return {
                serviceCategory: 'General Service',
                serviceCode: 'general_service',
                serviceMode: location ? 'local' : 'online',
                urgency: 'normal',
                estimatedDuration: { min: 30, max: 120 },
                suggestedQuestions: [
                    'Can you provide more details about what you need?',
                    'When would you like this service?'
                ],
                confidence: 0.3
            };
        }
    }
};
