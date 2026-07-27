import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretnanolinkjwtkey2026', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Please provide name, email, and password.' });
    }

    // Enforce password policy per Section 4 helper text: "Must be at least 8 characters long and contain a special character"
    if (password.length < 8 || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long and contain a special character.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered. Please log in.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      authProvider: 'local',
      plan: 'free',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FF6206&color=fff`
    });

    const token = generateToken(newUser._id);

    res.status(201).json({
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        authProvider: newUser.authProvider,
        avatarUrl: newUser.avatarUrl,
        plan: newUser.plan,
        monthlyLinkCount: newUser.monthlyLinkCount,
        monthlyQrCodeCount: newUser.monthlyQrCodeCount,
        monthlyCustomBackHalfCount: newUser.monthlyCustomBackHalfCount
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup.' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.authProvider === 'google' && !user.password) {
      return res.status(401).json({ error: 'This account uses Google login. Please click "Continue with Google".' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    await user.checkAndResetQuotas();

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        authProvider: user.authProvider,
        avatarUrl: user.avatarUrl,
        plan: user.plan,
        monthlyLinkCount: user.monthlyLinkCount,
        monthlyQrCodeCount: user.monthlyQrCodeCount,
        monthlyCustomBackHalfCount: user.monthlyCustomBackHalfCount
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    // req.user is already attached by protect middleware (which calls checkAndResetQuotas)
    const user = req.user;
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      authProvider: user.authProvider,
      avatarUrl: user.avatarUrl,
      plan: user.plan,
      planExpiresAt: user.planExpiresAt,
      monthlyLinkCount: user.monthlyLinkCount,
      monthlyQrCodeCount: user.monthlyQrCodeCount,
      monthlyCustomBackHalfCount: user.monthlyCustomBackHalfCount
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Server error fetching user profile.' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

// @desc    Google OAuth callback handler
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_failed`);
    }

    await req.user.checkAndResetQuotas();
    const token = generateToken(req.user._id);

    // Redirect to frontend dashboard with JWT in query parameter for AuthContext hydration
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard?token=${token}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_error`);
  }
};

// @desc    Get public plan limits per Section 6.2 (Dynamic Limits)
// @route   GET /api/auth/limits
// @access  Public
export const getPlanLimits = async (req, res) => {
  try {
    const PLAN_LIMITS = (await import('../constants/planLimits.js')).default;
    res.json(PLAN_LIMITS);
  } catch (error) {
    console.error('Get plan limits error:', error);
    res.status(500).json({ error: 'Failed to fetch plan limits.' });
  }
};
