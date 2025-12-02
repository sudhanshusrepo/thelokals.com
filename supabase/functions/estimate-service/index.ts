import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenAI, Type } from "npm:@google/genai";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { action, payload } = await req.json();
        const apiKey = Deno.env.get('GEMINI_API_KEY');

        if (!apiKey) {
            console.error('GEMINI_API_KEY is not set');
            throw new Error('Server configuration error');
        }

        const ai = new GoogleGenAI({ apiKey });

        if (action === 'interpretSearch') {
            const { query, categoriesList } = payload;

            const response = await ai.models.generateContent({
                model: "gemini-1.5-flash",
                contents: `User query: "${query}". 
        Available Categories: ${categoriesList}.
        Task: Analyze the query and map it to the best fitting Category. 
        Also extract keywords and detect if the user implies sorting by price (cheap, affordable), rating (best, top), or distance (near, close).
        Detect urgency (emergency, now, asap -> high).`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            category: {
                                type: Type.STRING,
                                description: "The most relevant worker category (must match one of the available categories or be null)"
                            },
                            keywords: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                                description: "Key terms extracted from query"
                            },
                            sortBy: {
                                type: Type.STRING,
                                enum: ['price', 'rating', 'distance', 'relevance'],
                                description: "Sorting preference implied by query"
                            },
                            urgency: {
                                type: Type.STRING,
                                enum: ['high', 'normal'],
                                description: "Urgency level"
                            }
                        },
                        required: ["category", "keywords", "sortBy", "urgency"]
                    }
                }
            });

            if (response.text) {
                return new Response(response.text, {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }
            throw new Error("Empty response from Gemini");

        } else if (action === 'estimateService') {
            const { input, category } = payload;

            const response = await ai.models.generateContent({
                model: "gemini-1.5-flash",
                contents: `You are a service cost estimator for ${category} services in India.
        
User's problem description: "${input}"

Task: Analyze this service request and provide:
1. An estimated cost in Indian Rupees (₹)
2. A detailed checklist of tasks needed to complete this service
3. Brief reasoning for the cost estimate

Consider typical market rates for ${category} services in India.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            estimatedCost: {
                                type: Type.NUMBER,
                                description: "Estimated cost in Indian Rupees"
                            },
                            checklist: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                                description: "List of tasks to complete the service"
                            },
                            reasoning: {
                                type: Type.STRING,
                                description: "Brief explanation of the cost estimate"
                            }
                        },
                        required: ["estimatedCost", "checklist", "reasoning"]
                    }
                }
            });

            if (response.text) {
                return new Response(response.text, {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }
            throw new Error("Empty response from Gemini");

        } else if (action === 'chat') {
            const { message, history } = payload;

            // Construct chat history for context if needed, for now just using the latest message
            // In a real app, you'd format history properly for the model

            const response = await ai.models.generateContent({
                model: "gemini-1.5-flash",
                contents: `You are a helpful AI assistant for 'thelokals.com', a platform connecting users with local service providers (plumbers, electricians, maids, etc.) and online professionals.
                
User message: "${message}"

Task: Provide a helpful, friendly, and concise response. 
If the user is looking for a service, guide them to use the search bar or describe their problem in the service request form.
If they ask about the platform, explain that we use AI to match them with the best professionals instantly.
Keep the tone professional yet conversational.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            response: {
                                type: Type.STRING,
                                description: "The AI's response to the user"
                            }
                        },
                        required: ["response"]
                    }
                }
            });

            if (response.text) {
                return new Response(response.text, {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }
            throw new Error("Empty response from Gemini");

        } else {
            throw new Error(`Unknown action: ${action}`);
        }

    } catch (error) {
        console.error('Edge Function Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
