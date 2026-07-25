import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import Link from '../models/Link.js';
import QrCode from '../models/QrCode.js';
import ClickEvent from '../models/ClickEvent.js';
import Payment from '../models/Payment.js';
import { sendPasswordResetEmail } from '../services/emailService.js';
import getRedisClient from '../config/redis.js';

// @desc    Update user profile preferences (name, avatar, defaultDomain) per Section 6.11
// @route   PUT /api/settings/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { name, avatarUrl, defaultDomain } = req.body;

    if (name !== undefined) user.name = name.trim();
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl.trim();
    if (defaultDomain !== undefined) {
      const allowedDomains = ['nano.link', 'nn.lk', 'nanolink.io'];
      if (!allowedDomains.includes(defaultDomain)) {
        return res.status(400).json({ error: 'Invalid default domain selection.' });
      }
      user.defaultDomain = defaultDomain;
    }

    await user.save();
    res.json({ success: true, message: 'Profile settings updated successfully.', user: user.toJSON() });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error updating profile preferences.' });
  }
};

// @desc    Request 6-digit OTP email for password change / reset per user instruction
// @route   POST /api/settings/password/request-otp
// @access  Public / Private (works with logged-in user or email in body)
export const requestPasswordChangeOtp = async (req, res) => {
  try {
    let targetUser = req.user;
    if (!targetUser && req.body.email) {
      targetUser = await User.findOne({ email: req.body.email.toLowerCase().trim() });
    }

    if (!targetUser) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }

    if (targetUser.authProvider === 'google' && !targetUser.password) {
      return res.status(400).json({
        error: 'Your account uses Google OAuth login. You do not have a local password to change.'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    targetUser.passwordResetOtp = otp;
    targetUser.passwordResetOtpExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry
    await targetUser.save();

    const emailRes = await sendPasswordResetEmail(targetUser.email, otp, targetUser.name);

    res.json({
      success: true,
      message: 'Verification code sent to your email address. Please check your inbox (and spam folder).',
      isMock: emailRes.isMock,
      mockOtp: emailRes.mockOtp // Returned only in zero-config dev mode for instant frontend testing
    });
  } catch (error) {
    console.error('Request password OTP error:', error);
    res.status(500).json({ error: 'Failed to send verification code email.' });
  }
};

// @desc    Verify OTP and change password per user instruction
// @route   POST /api/settings/password/verify-and-change
// @access  Public / Private
export const verifyAndChangePassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'Please provide OTP verification code and new password.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New password and confirm password do not match.' });
    }

    // Enforce password policy per Section 4 helper text
    if (newPassword.length < 8 || !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long and contain a special character.'
      });
    }

    let targetUser = req.user;
    if (!targetUser && email) {
      targetUser = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (!targetUser) {
      return res.status(404).json({ error: 'User account not found for verification.' });
    }

    if (!targetUser.passwordResetOtp || targetUser.passwordResetOtp !== otp.trim()) {
      return res.status(400).json({ error: 'Invalid verification code. Please check your email and try again.' });
    }

    if (new Date() > targetUser.passwordResetOtpExpire) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
    }

    // Hash new password and clear OTP
    const salt = await bcrypt.genSalt(10);
    targetUser.password = await bcrypt.hash(newPassword, salt);
    targetUser.passwordResetOtp = null;
    targetUser.passwordResetOtpExpire = null;
    await targetUser.save();

    res.json({
      success: true,
      message: 'Password changed successfully! Your account is secure.',
      user: targetUser.toJSON()
    });
  } catch (error) {
    console.error('Verify password change error:', error);
    res.status(500).json({ error: 'Server error verifying and changing password.' });
  }
};

// @desc    Generate new API key for account per Section 6.11
// @route   POST /api/settings/api-key
// @access  Private
export const generateApiKey = async (req, res) => {
  try {
    const user = req.user;
    const newKey = `nanolink_live_${crypto.randomBytes(24).toString('hex')}`;
    user.apiKey = newKey;
    await user.save();

    res.json({
      success: true,
      message: 'New personal API key generated successfully.',
      apiKey: newKey,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Generate API key error:', error);
    res.status(500).json({ error: 'Server error generating API key.' });
  }
};

// @desc    Permanent account deletion with cascading cleanup per Section 6.11
// @route   DELETE /api/settings/account
// @access  Private
export const deleteAccount = async (req, res) => {
  try {
    const user = req.user;
    const { confirmationText, password } = req.body;

    if (confirmationText !== 'DELETE') {
      return res.status(400).json({ error: 'Please type the word DELETE to confirm account deletion.' });
    }

    // If user has a local password, verify it before deletion
    if (user.authProvider === 'local' && user.password) {
      if (!password) {
        return res.status(400).json({ error: 'Please enter your current password to confirm deletion.' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Incorrect password. Account deletion aborted.' });
      }
    }

    // 1. Find all short links owned by user
    const userLinks = await Link.find({ owner: user._id });
    const linkIds = userLinks.map(l => l._id);

    // 2. Clear Redis redirect cache & counters per Section 8
    const redisClient = getRedisClient();
    if (redisClient && userLinks.length > 0) {
      for (const l of userLinks) {
        try {
          await redisClient.del(`redirect:${l.slug}`);
          await redisClient.del(`counter:link:${l._id.toString()}`);
        } catch (err) {
          console.warn(`Redis deletion warning for ${l.slug}:`, err);
        }
      }
    }

    // 3. Cascading MongoDB deletions per Section 6.11
    await ClickEvent.deleteMany({ linkId: { $in: linkIds } });
    await QrCode.deleteMany({ owner: user._id });
    await Link.deleteMany({ owner: user._id });
    await Payment.deleteMany({ userId: user._id });
    await User.findByIdAndDelete(user._id);

    console.log(`🗑️ Permanently deleted account ${user.email} and all associated links/QRs/analytics.`);

    res.json({
      success: true,
      message: 'Your account and all associated links, QR codes, and analytics data have been permanently deleted.'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Server error executing account deletion.' });
  }
};

export default {
  updateProfile,
  requestPasswordChangeOtp,
  verifyAndChangePassword,
  generateApiKey,
  deleteAccount
};
