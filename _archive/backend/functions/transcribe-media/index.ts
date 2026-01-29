import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenAI } from "npm:@google/genai";

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
        const { mediaUrl, type } = await req.json();
        const apiKey = Deno.env.get('GEMINI_API_KEY');

        if (!apiKey) {
            console.error('GEMINI_API_KEY is not set');
            throw new Error('Server configuration error');
        }

        // Download the file
        console.log(`Downloading media from: ${mediaUrl}`);
        const fileResponse = await fetch(mediaUrl);
        if (!fileResponse.ok) {
            throw new Error(`Failed to download media file: ${fileResponse.statusText}`);
        }

        const arrayBuffer = await fileResponse.arrayBuffer();
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

        const ai = new GoogleGenAI({ apiKey });
        const mimeType = type === 'audio' ? 'audio/webm' : 'video/webm';

        console.log(`Transcribing ${type} with mimeType: ${mimeType}`);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [
                        { inlineData: { mimeType, data: base64Data } },
                        { text: "Transcribe this audio/video exactly as spoken. Return only the text. If there is no speech, describe what is happening visually or audibly relevant to a service request." }
                    ]
                }
            ]
        });

        if (response.text) {
            return new Response(JSON.stringify({ text: response.text }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        throw new Error("Empty response from Gemini");

    } catch (error) {
        console.error('Transcription Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
