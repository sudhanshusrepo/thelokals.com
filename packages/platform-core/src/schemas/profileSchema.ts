import { z } from 'zod';

export const ProfileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    price: z.number().min(0, "Price must be positive"),
    imageUrl: z.string().optional().or(z.literal('')),
    category: z.string().min(1, "Service Category is required"),
    bankDetails: z.object({
        upi_id: z.string().optional(),
        account_number: z.string().optional(),
        ifsc_code: z.string().optional(),
        account_holder_name: z.string().optional()
    }).optional()
});

export type ProfileFormValues = z.infer<typeof ProfileSchema>;
