import { logger } from '../services/logger';
import { AppError } from './AppError';

export const handleError = (error: unknown, context?: string) => {
    const appError = AppError.fromError(error);

    logger.error(context ? `Error in ${context}: ${appError.message}` : appError.message, {
        code: appError.code,
        statusCode: appError.statusCode,
        originalError: appError.originalError,
        stack: appError.stack
    });

    return appError;
};
