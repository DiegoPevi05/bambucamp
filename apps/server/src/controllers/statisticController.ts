// controllers/statisticsController.ts
import { Request, Response } from 'express';
import * as statisticService from '../services/statisticService';
import { CustomError } from '../middleware/errors';

type Step = "W" | "M" | "Y";
type SeriesType = "A" | "P";

const parseAnchor = (anchor?: string) => {
  if (!anchor) return new Date(); // today
  // force to local midnight from supplied YYYY-MM-DD
  const [y, m, d] = anchor.split('-').map(Number);
  return new Date(y, (m - 1), d);
};

const baseHandler =
  (fn: (filters: any, language: string) => Promise<any>) =>
    async (req: Request, res: Response) => {
      try {
        const { step = 'W', type = 'P', anchor, offset = '0', tz = 'America/Lima' } = req.query;

        const filters = {
          step: step as Step,
          type: type as SeriesType,
          anchor: parseAnchor(anchor as string | undefined),
          offset: Number(offset) || 0,
          tz: String(tz || 'America/Lima'),
        };

        const language = req.language || 'en';
        const data = await fn(filters, language);

        res.json(data);
      } catch (error) {
        if (error instanceof CustomError) {
          res.status(error.statusCode).json({ error: error.message });
        } else {
          res.status(500).json({ error: req.t('error.failedToFetchStatistics') });
        }
      }
    };

export const getNetSalesStatistics = baseHandler(statisticService.getNetSalesStatistics);
export const getReserveQuantityStatistics = baseHandler(statisticService.getReserveQuantityStatistics);
