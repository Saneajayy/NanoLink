import express from 'express';
import { createLink, getLinks, getLinkById, updateLink, deleteLink } from '../controllers/linkController';
import { getLinkAnalytics, generateQRCode } from '../controllers/analyticsController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').post(protect, createLink).get(protect, getLinks);
router.route('/:id').get(protect, getLinkById).put(protect, updateLink).delete(protect, deleteLink);
router.route('/:id/analytics').get(protect, getLinkAnalytics);
router.route('/:id/qr').get(protect, generateQRCode);

export default router;
