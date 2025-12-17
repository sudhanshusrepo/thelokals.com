/**
 * Input Validation Utilities
 * Provides sanitization and validation for user inputs
 */

// Email validation
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
    const trimmed = email.trim();

    if (!trimmed) {
        return { valid: false, error: 'Email is required' };
    }

    // RFC 5322 compliant email regex (simplified)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmed)) {
        return { valid: false, error: 'Please enter a valid email address' };
    }

    // Check for common typos
    const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    const domain = trimmed.split('@')[1];
    const suspiciousDomains = ['gmial.com', 'gmai.com', 'yahooo.com'];

    if (suspiciousDomains.includes(domain)) {
        return { valid: false, error: 'Did you mean a common email provider?' };
    }

    return { valid: true };
};

// Password validation
export const validatePassword = (password: string): { valid: boolean; error?: string; strength?: 'weak' | 'medium' | 'strong' } => {
    if (!password) {
        return { valid: false, error: 'Password is required' };
    }

    if (password.length < 6) {
        return { valid: false, error: 'Password must be at least 6 characters long' };
    }

    // Calculate password strength
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score >= 5) strength = 'strong';
    else if (score >= 3) strength = 'medium';

    return { valid: true, strength };
};

// Phone number validation
export const validatePhone = (phone: string): { valid: boolean; error?: string } => {
    const cleaned = phone.replace(/\D/g, '');

    if (!cleaned) {
        return { valid: false, error: 'Phone number is required' };
    }

    // Allow 10-15 digits (international formats)
    if (cleaned.length < 10 || cleaned.length > 15) {
        return { valid: false, error: 'Please enter a valid phone number' };
    }

    return { valid: true };
};

// Name validation
export const validateName = (name: string): { valid: boolean; error?: string } => {
    const trimmed = name.trim();

    if (!trimmed) {
        return { valid: false, error: 'Name is required' };
    }

    if (trimmed.length < 2) {
        return { valid: false, error: 'Name must be at least 2 characters' };
    }

    if (trimmed.length > 100) {
        return { valid: false, error: 'Name is too long' };
    }

    // Check for invalid characters (allow letters, spaces, hyphens, apostrophes)
    if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
        return { valid: false, error: 'Name contains invalid characters' };
    }

    return { valid: true };
};

// Text sanitization (prevent XSS)
export const sanitizeText = (text: string): string => {
    return text
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

// URL validation
export const validateUrl = (url: string): { valid: boolean; error?: string } => {
    try {
        const urlObj = new URL(url);

        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
            return { valid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
        }

        return { valid: true };
    } catch {
        return { valid: false, error: 'Please enter a valid URL' };
    }
};

// Number validation
export const validateNumber = (value: string | number, options?: { min?: number; max?: number }): { valid: boolean; error?: string } => {
    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) {
        return { valid: false, error: 'Please enter a valid number' };
    }

    if (options?.min !== undefined && num < options.min) {
        return { valid: false, error: `Value must be at least ${options.min}` };
    }

    if (options?.max !== undefined && num > options.max) {
        return { valid: false, error: `Value must be at most ${options.max}` };
    }

    return { valid: true };
};

// Generic text validation
export const validateText = (text: string, options?: { minLength?: number; maxLength?: number; required?: boolean }): { valid: boolean; error?: string } => {
    const trimmed = text.trim();

    if (options?.required && !trimmed) {
        return { valid: false, error: 'This field is required' };
    }

    if (options?.minLength && trimmed.length < options.minLength) {
        return { valid: false, error: `Must be at least ${options.minLength} characters` };
    }

    if (options?.maxLength && trimmed.length > options.maxLength) {
        return { valid: false, error: `Must be at most ${options.maxLength} characters` };
    }

    return { valid: true };
};

// Prevent SQL injection in search queries
export const sanitizeSearchQuery = (query: string): string => {
    return query
        .trim()
        .replace(/[;'"\\]/g, '') // Remove SQL special characters
        .substring(0, 100); // Limit length
};

// Validate and sanitize form data
export const validateFormData = <T extends Record<string, any>>(
    data: T,
    rules: Partial<Record<keyof T, (value: any) => { valid: boolean; error?: string }>>
): { valid: boolean; errors: Partial<Record<keyof T, string>> } => {
    const errors: Partial<Record<keyof T, string>> = {};

    for (const [field, validator] of Object.entries(rules)) {
        const result = validator(data[field as keyof T]);
        if (!result.valid && result.error) {
            errors[field as keyof T] = result.error;
        }
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
};
