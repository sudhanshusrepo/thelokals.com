import { GoogleGenAI, Type } from "@google/genai";
import { SearchIntent, WorkerCategory } from "../types";

// Helper to safely get API key
const getApiKey = () => import.meta.env.VITE_GEMINI_API_KEY || '';

export const interpretSearchQuery = async (query: string): Promise<SearchIntent> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.warn("No API Key found, returning default search intent");
        return {
            category: null,
            keywords: [query],
            sortBy: 'relevance',
            urgency: 'normal'
        };
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const categoriesList = Object.values(WorkerCategory).join(', ');

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
              enum: Object.values(WorkerCategory),
              description: "The most relevant worker category"
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
      const data = JSON.parse(response.text) as SearchIntent;
      return data;
    }

    throw new Error("Empty response from Gemini");

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback intent
    return {
      category: null,
      keywords: query.split(" "),
      sortBy: 'relevance',
      urgency: 'normal'
    };
  }
};
