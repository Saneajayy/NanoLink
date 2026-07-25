import express from 'express';
import { createQr, getQrCodes, getQrById, updateQr, deleteQr } from '../controllers/qrController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, createQr)
  .get(protect, getQrCodes);

router.route('/:id')
  .get(protect, getQrById)
  .put(protect, updateQr)
  .delete(protect, deleteQr);

export default router;
