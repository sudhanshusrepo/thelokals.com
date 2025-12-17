import { GoogleGenAI, Type } from "@google/genai";
import { logger } from '@thelocals/core/services/logger';

const apiKey = process.env.API_KEY || ''; // Fallback for safety, though strictly required
const ai = new GoogleGenAI({ apiKey });

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export async function analyzeIdCard(file: File) {
  try {
    const base64Data = await fileToGenerativePart(file);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: file.type
            }
          },
          {
            text: "Analyze this image. If it is a valid government ID card, extract the full name and date of birth. If not, indicate it is invalid."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValidId: { type: Type.BOOLEAN },
            fullName: { type: Type.STRING },
            dob: { type: Type.STRING, description: "YYYY-MM-DD format if found, else empty" },
            idType: { type: Type.STRING, description: "Type of ID detected (e.g., Driver License, Passport, Aadhaar)" }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    logger.error("Gemini analysis failed:", error);
    throw error;
  }
}

export async function checkSelfie(file: File) {
  try {
    const base64Data = await fileToGenerativePart(file);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: file.type
            }
          },
          {
            text: "Is this a clear selfie of a person's face? Answer strict boolean."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isClearSelfie: { type: Type.BOOLEAN },
            description: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    logger.error("Gemini analysis failed:", error);
    throw error;
  }
}
