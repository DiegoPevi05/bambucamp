import { Router } from 'express';
import { inventoryReport, salesReport } from '../controllers/reportController';
import { authenticateToken, checkRole } from '../middleware/auth';

const router = Router();

router.get('/inventory', authenticateToken, checkRole('ADMIN', 'SUPERVISOR'), inventoryReport);
router.get('/sales', authenticateToken, checkRole('ADMIN', 'SUPERVISOR'), salesReport);

export default router;
