
import { z } from 'zod';

export const ProfileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    price: z.number().min(0, "Price must be positive"),
    imageUrl: z.string().url("Invalid Image URL").optional().or(z.literal('')),
    bankDetails: z.object({
        upi_id: z.string().optional(),
        account_number: z.string().optional(),
        ifsc_code: z.string().optional(),
        account_holder_name: z.string().optional()
    }).optional()
});

export type ProfileFormValues = z.infer<typeof ProfileSchema>;
