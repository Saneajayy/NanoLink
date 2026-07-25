import express from 'express';
import { 
  createOrder, 
  verifyPayment, 
  downgradePlan, 
  getBillingStatus, 
  handleWebhook 
} from '../controllers/billingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public webhook route (verified via HMAC signature header inside controller)
router.post('/webhook', handleWebhook);

// Protected routes
router.use(protect);

router.get('/status', getBillingStatus);
router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);
router.post('/downgrade', downgradePlan);

export default router;
