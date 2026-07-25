import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    default: null // Hashed with bcrypt, null if OAuth-only
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  googleId: {
    type: String,
    default: null
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  plan: {
    type: String,
    enum: ['free', 'core'],
    default: 'free'
  },
  planExpiresAt: {
    type: Date,
    default: null
  },
  razorpayCustomerId: {
    type: String,
    default: null
  },
  monthlyLinkCount: {
    type: Number,
    default: 0
  },
  monthlyLinkCountResetAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  monthlyQrCodeCount: {
    type: Number,
    default: 0
  },
  monthlyQrCodeCountResetAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  monthlyCustomBackHalfCount: {
    type: Number,
    default: 0
  },
  monthlyCustomBackHalfCountResetAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  defaultDomain: {
    type: String,
    default: 'nano.link'
  },
  apiKey: {
    type: String,
    default: null
  },
  passwordResetOtp: {
    type: String,
    default: null
  },
  passwordResetOtpExpire: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Helper method to reset monthly quotas if expired
userSchema.methods.checkAndResetQuotas = async function() {
  const now = new Date();
  let modified = false;

  if (now > this.monthlyLinkCountResetAt) {
    this.monthlyLinkCount = 0;
    this.monthlyLinkCountResetAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    modified = true;
  }
  if (now > this.monthlyQrCodeCountResetAt) {
    this.monthlyQrCodeCount = 0;
    this.monthlyQrCodeCountResetAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    modified = true;
  }
  if (now > this.monthlyCustomBackHalfCountResetAt) {
    this.monthlyCustomBackHalfCount = 0;
    this.monthlyCustomBackHalfCountResetAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    modified = true;
  }

  if (modified) {
    await this.save();
  }
  return this;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
