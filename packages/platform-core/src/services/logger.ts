/**
 * Structured Logging Service
 * Centralizes logging to allow for easier integration with monitoring tools (e.g., Sentry, Datadog)
 * and standardized formatting.
 */

import { CONFIG } from '../config';

const isDev = CONFIG.IS_DEV;

export const logger = {
  info: (message: string, context?: Record<string, any>) => {
    if (isDev) {
      console.log(`ℹ️ [INFO] ${message}`, context || '');
    } else {
      console.log(JSON.stringify({ level: 'info', message, context, timestamp: new Date().toISOString() }));
    }
  },

  warn: (message: string, context?: Record<string, any>) => {
    if (isDev) {
      console.warn(`⚠️ [WARN] ${message}`, context || '');
    } else {
      console.warn(JSON.stringify({ level: 'warn', message, context, timestamp: new Date().toISOString() }));
    }
  },

  error: (message: string, error?: any, context?: Record<string, any>) => {
    if (isDev) {
      console.error(`🚨 [ERROR] ${message}`, error, context || '');
    } else {
      console.error(JSON.stringify({
        level: 'error',
        message,
        error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
        context,
        timestamp: new Date().toISOString()
      }));
    }
  },

  debug: (message: string, context?: Record<string, any>) => {
    if (isDev) {
      console.debug(`🐛 [DEBUG] ${message}`, context || '');
    }
  }
};
