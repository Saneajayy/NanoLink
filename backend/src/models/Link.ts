import mongoose, { Document, Schema } from 'mongoose';

export interface ILink extends Document {
  slug: string;
  originalUrl: string;
  customAlias: boolean;
  owner: mongoose.Types.ObjectId;
  title?: string;
  isActive: boolean;
  qrCodeUrl?: string;
  createdAt: Date;
  expiresAt?: Date;
  safeBrowsingChecked?: boolean;
  totalClicks: number;
}

const linkSchema = new Schema<ILink>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    originalUrl: { type: String, required: true },
    customAlias: { type: Boolean, default: false },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String },
    isActive: { type: Boolean, default: true },
    qrCodeUrl: { type: String },
    expiresAt: { type: Date },
    safeBrowsingChecked: { type: Boolean, default: false },
    totalClicks: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Link = mongoose.model<ILink>('Link', linkSchema);

export default Link;
