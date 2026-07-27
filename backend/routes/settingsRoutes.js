import express from 'express';
import { 
  updateProfile, 
  requestPasswordChangeOtp, 
  verifyAndChangePassword, 
  generateApiKey, 
  deleteAccount 
} from '../controllers/settingsController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Password verification endpoints (works for both authenticated Settings change and unauthenticated Forgot Password)
router.post('/password/request-otp', authLimiter, optionalAuth, requestPasswordChangeOtp);
router.post('/password/verify-and-change', authLimiter, optionalAuth, verifyAndChangePassword);

// Protected routes (require valid JWT)
router.use(protect);

router.put('/profile', updateProfile);
router.post('/api-key', generateApiKey);
router.delete('/account', deleteAccount);

export default router;
