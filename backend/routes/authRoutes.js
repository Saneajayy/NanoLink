import express from 'express';
import passport from 'passport';
import { signup, login, getMe, logout, googleCallback, getPlanLimits } from '../controllers/authController.js';
import protect from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/limits', getPlanLimits);
router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=oauth_failed', session: false }),
  googleCallback
);

export default router;
