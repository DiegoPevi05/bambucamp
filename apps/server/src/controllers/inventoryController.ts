import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { InventoryMovementType } from '../dto/inventory';
import * as inventoryService from '../services/inventoryService';
import { CustomError } from '../middleware/errors';

const parseMovementType = (value: string | undefined): InventoryMovementType | undefined => {
  if (!value) return undefined;
  if (value === 'IN' || value === 'OUT' || value === 'ADJUSTMENT') {
    return value;
  }
  return undefined;
};

export const getProductTransactions = async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.productId);
    if (!Number.isFinite(productId) || productId <= 0) {
      return res.status(400).json({ error: req.t('validation.idRequired') });
    }

    const page = Math.max(1, parseInt((req.query.page as string) ?? '1', 10) || 1);
    const pageSize = Math.max(1, parseInt((req.query.pageSize as string) ?? '10', 10) || 10);
    const type = parseMovementType(req.query.type as string | undefined);
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;

    const ledger = await inventoryService.getProductLedger(productId, { page, pageSize }, {
      type,
      search,
    });

    res.json(ledger);
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t('error.failedToFetchInventoryLedger') });
    }
  }
};

export const createInventoryTransaction = [
  body('productId').isInt({ gt: 0 }).withMessage('validation.productIdRequired'),
  body('type').isIn(['IN', 'OUT', 'ADJUSTMENT']).withMessage('validation.movementTypeRequired'),
  body('quantity').isInt({ gt: 0 }).withMessage('validation.quantityPositive'),
  body('note').optional().isString(),
  body('reference').optional().isString(),

  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const localizedErrors = errors.array().map((error) => ({
        ...error,
        msg: req.t(error.msg),
      }));

      return res.status(400).json({ error: localizedErrors });
    }

    try {
      const result = await inventoryService.createTransaction({
        productId: Number(req.body.productId),
        type: req.body.type,
        quantity: Number(req.body.quantity),
        note: req.body.note,
        reference: req.body.reference,
        createdById: req.user?.id,
      });

      res.status(201).json({
        message: req.t('message.inventoryTransactionCreated'),
        transaction: result.transaction,
        stock: result.stock,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t('error.failedToCreateInventoryTransaction') });
      }
    }
  },
];
