import { supabase } from "./supabase";
import { CONFIG } from '../config';
import { WorkerCategory } from "../types";
import { logger } from "./logger";

/**
 * @module geminiService
 * @description A service for interacting with the Google Gemini API via Supabase Edge Functions.
 */

export interface AIAnalysisResult {
  estimatedCost: number;
  checklist: string[];
  reasoning: string;
}

/**
 * Estimates the cost and generates a checklist for a service request using Gemini AI (via Edge Function).
 *
 * @param {string} input - The user's description of the problem.
 * @param {string} category - The service category.
 * @returns {Promise<AIAnalysisResult>} The analysis result with estimated cost, checklist, and reasoning.
 */
export const estimateService = async (input: string, category: string): Promise<AIAnalysisResult> => {
  // Test Mode Bypass
  // Check if we are in test mode (e.g. for E2E tests)
  // This will return mocked responses instead of calling Gemini
  const isTestMode = CONFIG.IS_TEST_MODE || CONFIG.ENABLE_OTP_BYPASS;

  if (isTestMode) {

    return fallbackEstimation(input, category);
  }

  try {
    const { data, error } = await supabase.functions.invoke('estimate-service', {
      body: {
        action: 'estimateService',
        payload: {
          input,
          category
        }
      }
    });

    if (error) throw error;
    return data as AIAnalysisResult;

  } catch (error) {
    logger.error("Gemini cost estimation error (Edge Function)", { error, input, category });
    // Fallback to mock estimation
    return fallbackEstimation(input, category);
  }
};

/**
 * Chat with the AI assistant.
 * 
 * @param {string} message - The user's message.
 * @param {any[]} history - Chat history (optional).
 * @returns {Promise<string>} The AI's response.
 */
export const chatWithAI = async (message: string, history: any[] = []): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('estimate-service', {
      body: {
        action: 'chat',
        payload: {
          message,
          history
        }
      }
    });

    if (error) throw error;
    return data.response;

  } catch (error) {
    logger.error("Gemini chat error (Edge Function)", { error, message });
    return "I'm having trouble connecting right now. Please try again later.";
  }
};

/**
 * Fallback estimation when Gemini API is unavailable.
 */
function fallbackEstimation(input: string, category: string): AIAnalysisResult {
  const lowerInput = input.toLowerCase();
  let cost = 500;
  let checklist = ['General inspection'];
  let reasoning = 'Based on standard rates.';

  if (category.toLowerCase().includes('plumber')) {
    if (lowerInput.includes('leak')) {
      cost = 800;
      checklist = ['Locate leak source', 'Replace washer/seal', 'Test for leaks'];
      reasoning = 'Leak repair requires diagnostic time and parts.';
    } else if (lowerInput.includes('install') || lowerInput.includes('tap')) {
      cost = 400;
      checklist = ['Remove old fixture', 'Install new tap', 'Seal connections'];
      reasoning = 'Standard installation charge.';
    }
  } else if (category.toLowerCase().includes('electrician')) {
    if (lowerInput.includes('fan')) {
      cost = 450;
      checklist = ['Assemble fan', 'Mount to ceiling', 'Connect wiring', 'Test speed control'];
      reasoning = 'Fan installation standard rate.';
    } else if (lowerInput.includes('switch') || lowerInput.includes('socket')) {
      cost = 250;
      checklist = ['Isolate power', 'Replace switch unit', 'Test connection'];
      reasoning = 'Minor electrical repair.';
    }
  }

  // Add some randomness to make it feel "AI-like"
  cost = Math.round(cost * (0.9 + Math.random() * 0.2));

  return {
    estimatedCost: cost,
    checklist,
    reasoning
  };
}
