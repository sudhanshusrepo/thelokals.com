import DOMPurify from 'dompurify';

/**
 * Sanitize user input to prevent XSS attacks
 * @param input - The user input to sanitize
 * @returns Sanitized string safe for display
 */
export const sanitizeInput = (input: string): string => {
    if (!input) return '';

    // Configure DOMPurify to be strict
    const config = {
        ALLOWED_TAGS: [], // No HTML tags allowed
        ALLOWED_ATTR: [], // No attributes allowed
        KEEP_CONTENT: true, // Keep text content
    };

    return DOMPurify.sanitize(input, config);
};

/**
 * Sanitize HTML content while allowing safe tags
 * @param html - The HTML content to sanitize
 * @returns Sanitized HTML safe for rendering
 */
export const sanitizeHTML = (html: string): string => {
    if (!html) return '';

    // Allow only safe HTML tags
    const config = {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
        ALLOWED_ATTR: ['href', 'title'],
        ALLOW_DATA_ATTR: false,
    };

    return DOMPurify.sanitize(html, config);
};

/**
 * Validate and sanitize email input
 * @param email - The email to validate and sanitize
 * @returns Sanitized email or empty string if invalid
 */
export const sanitizeEmail = (email: string): string => {
    if (!email) return '';

    // Remove any HTML/script tags
    const sanitized = sanitizeInput(email);

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(sanitized) ? sanitized : '';
};

/**
 * Sanitize form data object
 * @param data - Object containing form data
 * @returns Sanitized form data
 */
export const sanitizeFormData = <T extends Record<string, any>>(data: T): T => {
    const sanitized = {} as T;

    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
            sanitized[key as keyof T] = sanitizeInput(value) as T[keyof T];
        } else {
            sanitized[key as keyof T] = value;
        }
    }

    return sanitized;
};
