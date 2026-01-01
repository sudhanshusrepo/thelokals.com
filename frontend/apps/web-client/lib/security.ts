/**
 * Security Utilities
 * 
 * Input sanitization, XSS protection, and secure cookie handling.
 */

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Sanitize URL to prevent javascript: and data: URIs
 */
export function sanitizeUrl(url: string): string {
    const trimmed = url.trim().toLowerCase();

    // Block dangerous protocols
    if (
        trimmed.startsWith('javascript:') ||
        trimmed.startsWith('data:') ||
        trimmed.startsWith('vbscript:')
    ) {
        return 'about:blank';
    }

    return url;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number (basic)
 */
export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
}

/**
 * Strip HTML tags from string
 */
export function stripHtmlTags(input: string): string {
    return input.replace(/<[^>]*>/g, '');
}

/**
 * Validate and sanitize user input
 */
export function sanitizeInput(input: string, maxLength: number = 1000): string {
    // Trim whitespace
    let sanitized = input.trim();

    // Limit length
    if (sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    // Escape HTML
    sanitized = escapeHtml(sanitized);

    return sanitized;
}

/**
 * Generate CSRF token
 */
export function generateCsrfToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Secure cookie options
 */
export interface SecureCookieOptions {
    maxAge?: number; // seconds
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Set secure cookie
 */
export function setSecureCookie(
    name: string,
    value: string,
    options: SecureCookieOptions = {}
) {
    const defaults: SecureCookieOptions = {
        path: '/',
        secure: window.location.protocol === 'https:',
        sameSite: 'lax',
    };

    const opts = { ...defaults, ...options };

    let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (opts.maxAge) {
        cookie += `; Max-Age=${opts.maxAge}`;
    }

    if (opts.path) {
        cookie += `; Path=${opts.path}`;
    }

    if (opts.domain) {
        cookie += `; Domain=${opts.domain}`;
    }

    if (opts.secure) {
        cookie += '; Secure';
    }

    if (opts.sameSite) {
        cookie += `; SameSite=${opts.sameSite}`;
    }

    document.cookie = cookie;
}

/**
 * Get cookie value
 */
export function getCookie(name: string): string | null {
    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.indexOf(nameEQ) === 0) {
            return decodeURIComponent(cookie.substring(nameEQ.length));
        }
    }

    return null;
}

/**
 * Delete cookie
 */
export function deleteCookie(name: string, path: string = '/') {
    setSecureCookie(name, '', { maxAge: -1, path });
}
