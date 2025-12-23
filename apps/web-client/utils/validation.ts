import { z } from 'zod';

/**
 * Input Validation Schemas
 * 
 * Zod schemas for validating and sanitizing user inputs.
 */

// Email validation
export const emailSchema = z
    .string()
    .email('Invalid email address')
    .max(255, 'Email is too long');

// Phone validation (international format)
export const phoneSchema = z
    .string()
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Invalid phone number')
    .min(10, 'Phone number is too short')
    .max(20, 'Phone number is too long');

// Name validation
export const nameSchema = z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters');

// Address validation
export const addressSchema = z.object({
    street: z.string().min(1, 'Street address is required').max(200),
    city: z.string().min(1, 'City is required').max(100),
    state: z.string().min(1, 'State is required').max(100),
    zipCode: z.string().regex(/^[0-9]{5,10}$/, 'Invalid ZIP code'),
    country: z.string().min(1, 'Country is required').max(100),
});

// Service request validation
export const serviceRequestSchema = z.object({
    serviceCode: z.string().min(1, 'Service code is required'),
    description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description is too long'),
    location: addressSchema,
    preferredDate: z.string().datetime('Invalid date format').optional(),
    urgency: z.enum(['low', 'medium', 'high']).optional(),
});

// Booking details validation
export const bookingDetailsSchema = z.object({
    name: nameSchema,
    phone: phoneSchema,
    email: emailSchema.optional(),
    address: addressSchema,
    notes: z.string().max(500, 'Notes are too long').optional(),
});

// Search query validation
export const searchQuerySchema = z
    .string()
    .min(2, 'Search query must be at least 2 characters')
    .max(200, 'Search query is too long')
    .regex(/^[a-zA-Z0-9\s,.-]+$/, 'Search query contains invalid characters');

/**
 * Validate and sanitize input
 */
export function validateInput<T>(schema: z.ZodSchema<T>, input: unknown): { success: boolean; data?: T; errors?: string[] } {
    const result = schema.safeParse(input);

    if (result.success) {
        return { success: true, data: result.data };
    }

    const errors = result.error.errors.map((err) => err.message);
    return { success: false, errors };
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/\0/g, ''); // Remove null bytes
}

/**
 * Validate file upload
 */
export const fileUploadSchema = z.object({
    name: z.string().max(255),
    size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
    type: z.enum([
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'application/pdf',
        'video/mp4',
        'video/webm',
        'audio/mpeg',
        'audio/webm',
    ], { errorMap: () => ({ message: 'Invalid file type' }) }),
});

export type FileUpload = z.infer<typeof fileUploadSchema>;
export type ServiceRequest = z.infer<typeof serviceRequestSchema>;
export type BookingDetails = z.infer<typeof bookingDetailsSchema>;
export type Address = z.infer<typeof addressSchema>;
