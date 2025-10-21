import { Request, Response } from 'express';
import { InventoryReportFilters } from '@bambucamp/shared-types';
import { generateInventoryReport, generateSalesReport } from '../services/reportService';
import { CustomError } from '../middleware/errors';

const resolveUserName = (req: Request): string | null => {
  const user: any = req.user;
  if (!user) {
    return null;
  }

  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  if (name.length > 0) {
    return name;
  }

  return user.email ?? null;
};

const parseProductIds = (input: string | string[] | undefined): number[] | undefined => {
  if (!input) {
    return undefined;
  }

  const values = Array.isArray(input) ? input : [input];
  const ids = values
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isFinite(value) && value > 0);

  return ids.length ? ids : undefined;
};

export const inventoryReport = async (req: Request, res: Response) => {
  const locale = req.language || 'en';
  const translator = req.t.bind(req);

  try {
    const result = await generateInventoryReport({
      dateFrom: String(req.query.dateFrom ?? ''),
      dateTo: String(req.query.dateTo ?? ''),
      format: (req.query.format as 'pdf' | 'csv') ?? 'pdf',
      sortBy: (req.query.sortBy as InventoryReportFilters['sortBy']) ?? 'stock_desc',
      productIds: parseProductIds(req.query.productIds as string | string[] | undefined),
    }, {
      locale,
      translator,
      userName: resolveUserName(req),
    });

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    return res.status(200).send(result.content);
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: req.t(error.message) });
    }

    console.error('inventoryReport', error);
    return res.status(500).json({ error: req.t('error.failedToGenerateReport') });
  }
};

export const salesReport = async (req: Request, res: Response) => {
  const locale = req.language || 'en';
  const translator = req.t.bind(req);

  try {
    const result = await generateSalesReport({
      dateFrom: String(req.query.dateFrom ?? ''),
      dateTo: String(req.query.dateTo ?? ''),
      format: (req.query.format as 'pdf' | 'csv') ?? 'pdf',
    }, {
      locale,
      translator,
      userName: resolveUserName(req),
    });

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    return res.status(200).send(result.content);
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: req.t(error.message) });
    }

    console.error('salesReport', error);
    return res.status(500).json({ error: req.t('error.failedToGenerateReport') });
  }
};
