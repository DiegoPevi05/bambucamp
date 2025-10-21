import { z } from 'zod';

export const InventoryTransactionSchema = z.object({
  productId: z.number({ message: 'inventory.validation.productId' }).int({ message: 'inventory.validation.productId' }).positive({ message: 'inventory.validation.productId' }),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT'], { message: 'inventory.validation.movementType' }),
  quantity: z.number({ message: 'inventory.validation.quantityPositive' }).int({ message: 'inventory.validation.quantityPositive' }).positive({ message: 'inventory.validation.quantityPositive' }),
  note: z
    .string()
    .trim()
    .max(255, 'inventory.validation.noteMax')
    .optional()
    .or(z.literal(''))
    .transform((value) => (value ? value : undefined)),
  reference: z
    .string()
    .trim()
    .max(255, 'inventory.validation.referenceMax')
    .optional()
    .or(z.literal(''))
    .transform((value) => (value ? value : undefined)),
});

export type InventoryTransactionForm = z.infer<typeof InventoryTransactionSchema>;
