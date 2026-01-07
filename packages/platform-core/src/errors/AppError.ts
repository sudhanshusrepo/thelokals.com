export enum ErrorCode {
    // Auth Errors
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    USER_NOT_FOUND = 'USER_NOT_FOUND',

    // Validation Errors
    INVALID_INPUT = 'INVALID_INPUT',
    MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

    // Resource Errors
    NOT_FOUND = 'NOT_FOUND',
    ALREADY_EXISTS = 'ALREADY_EXISTS',

    // System Errors
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
    NETWORK_ERROR = 'NETWORK_ERROR',
    DATABASE_ERROR = 'DATABASE_ERROR',

    // Business Logic Errors
    BOOKING_FAILED = 'BOOKING_FAILED',
    PAYMENT_FAILED = 'PAYMENT_FAILED',
    AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
}

export class AppError extends Error {
    public readonly code: ErrorCode;
    public readonly statusCode: number;
    public readonly originalError?: unknown;

    constructor(message: string, code: ErrorCode, statusCode: number = 500, originalError?: unknown) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.statusCode = statusCode;
        this.originalError = originalError;

        // Maintain proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AppError);
        }
    }

    static fromError(error: unknown): AppError {
        if (error instanceof AppError) {
            return error;
        }

        if (error instanceof Error) {
            return new AppError(error.message, ErrorCode.INTERNAL_SERVER_ERROR, 500, error);
        }

        return new AppError('An unexpected error occurred', ErrorCode.INTERNAL_SERVER_ERROR, 500, error);
    }
}
