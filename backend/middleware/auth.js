import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretnanolinkjwtkey2026');

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ error: 'User not found or account deactivated.' });
      }

      // Check and reset monthly quotas if 30-day window has passed
      await user.checkAndResetQuotas();

      req.user = user;
      next();
    } catch (error) {
      console.error('Auth token verification failed:', error.message);
      return res.status(401).json({ error: 'Not authorized, token invalid or expired.' });
    }
  } else {
    return res.status(401).json({ error: 'Not authorized, no token provided.' });
  }
};

export const requireCorePlan = (req, res, next) => {
  if (!req.user || req.user.plan !== 'core') {
    return res.status(403).json({
      error: 'QUOTA_EXCEEDED',
      message: 'This feature is available exclusively on the Core plan. Please upgrade to unlock advanced capabilities.'
    });
  }
  next();
};

export const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretnanolinkjwtkey2026');
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        await user.checkAndResetQuotas();
        req.user = user;
      }
    } catch (err) {
      // Ignore token errors for optionalAuth
    }
  }
  next();
};

export default protect;
