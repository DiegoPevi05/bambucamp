import express from 'express';
import * as inventoryController from '../controllers/inventoryController';
import { authenticateToken, checkRole } from '../middleware/auth';

const router = express.Router();

router.get(
  '/:productId/transactions',
  authenticateToken,
  checkRole('ADMIN', 'SUPERVISOR'),
  inventoryController.getProductTransactions,
);

router.post(
  '/transactions',
  authenticateToken,
  checkRole('ADMIN', 'SUPERVISOR'),
  inventoryController.createInventoryTransaction,
);

export default router;
