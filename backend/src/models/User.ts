import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name?: string;
  email: string;
  password?: string;
  authProvider: 'local' | 'google';
  googleId?: string;
  avatarUrl?: string;
  plan: 'free' | 'core';
  planExpiresAt?: Date;
  billingCycle?: 'monthly' | 'annual';
  razorpayCustomerId?: string;
  createdAt: Date;
  monthlyLinkCount: number;
  monthlyLinkCountResetAt: Date;
  monthlyQrCodeCount: number;
  monthlyQrCodeCountResetAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    googleId: { type: String },
    avatarUrl: { type: String },
    plan: { type: String, enum: ['free', 'core'], default: 'free' },
    planExpiresAt: { type: Date },
    billingCycle: { type: String, enum: ['monthly', 'annual'] },
    razorpayCustomerId: { type: String },
    monthlyLinkCount: { type: Number, default: 0 },
    monthlyLinkCountResetAt: { type: Date, default: Date.now },
    monthlyQrCodeCount: { type: Number, default: 0 },
    monthlyQrCodeCountResetAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword: string) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password before saving
userSchema.pre('save', async function (next: any) {
  if (!this.isModified('password') || !this.password) {
    next();
  } else {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  }
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
