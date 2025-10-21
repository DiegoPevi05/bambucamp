import { z } from 'zod';
import { InventoryReportFilters, SalesReportFilters } from '@bambucamp/shared-types';

const isoDateSchema = z
  .string()
  .min(1, { message: 'reports.validation.date_required' })
  .refine((value) => !Number.isNaN(Date.parse(value)), { message: 'reports.validation.date_invalid' });

export const inventoryReportSchema = z
  .object({
    dateFrom: isoDateSchema,
    dateTo: isoDateSchema,
    format: z.enum(['pdf', 'csv'], { message: 'reports.validation.format_invalid' }),
    sortBy: z.enum(['stock_desc', 'stock_asc', 'qty_desc', 'qty_asc'], { message: 'reports.validation.sort_invalid' }),
    productIds: z
      .array(
        z
          .number({ invalid_type_error: 'reports.validation.product_invalid' })
          .int({ message: 'reports.validation.product_invalid' })
          .positive({ message: 'reports.validation.product_invalid' }),
      )
      .optional(),
  })
  .refine((value) => new Date(value.dateFrom) <= new Date(value.dateTo), {
    message: 'reports.validation.range',
    path: ['dateTo'],
  })
  .refine((value) => {
    if (!value.productIds) {
      return true;
    }
    const unique = new Set(value.productIds);
    return unique.size === value.productIds.length;
  }, {
    message: 'reports.validation.product_duplicate',
    path: ['productIds'],
  });

export const salesReportSchema = z
  .object({
    dateFrom: isoDateSchema,
    dateTo: isoDateSchema,
    format: z.enum(['pdf', 'csv'], { message: 'reports.validation.format_invalid' }),
  })
  .refine((value) => new Date(value.dateFrom) <= new Date(value.dateTo), {
    message: 'reports.validation.range',
    path: ['dateTo'],
  });

export type InventoryReportForm = InventoryReportFilters & { productIds: number[] };

export type SalesReportForm = SalesReportFilters;
