import { z } from 'zod';

export const createStoreSchema = z.object({
  type: z.enum(['woocommerce', 'medusa'], {
    required_error: 'Store type is required',
    invalid_type_error: 'Store type must be either "woocommerce" or "medusa"'
  })
});

export type CreateStoreRequest = z.infer<typeof createStoreSchema>;
