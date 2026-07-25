import express from 'express';
import { getAnalytics, exportCsv } from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getAnalytics);
router.get('/export', exportCsv);

export default router;
