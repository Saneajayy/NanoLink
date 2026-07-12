import mongoose, { Document, Schema } from 'mongoose';

export interface IClickEvent extends Document {
  linkId: mongoose.Types.ObjectId;
  timestamp: Date;
  referrer?: string;
  country?: string;
  device?: 'mobile' | 'desktop' | 'tablet' | 'other';
  browser?: string;
  ipHash?: string;
}

const clickEventSchema = new Schema<IClickEvent>({
  linkId: { type: Schema.Types.ObjectId, ref: 'Link', required: true, index: true },
  timestamp: { type: Date, default: Date.now, index: true },
  referrer: { type: String },
  country: { type: String },
  device: { type: String, enum: ['mobile', 'desktop', 'tablet', 'other'] },
  browser: { type: String },
  ipHash: { type: String },
});

// Compound index as per spec for efficient analytics queries
clickEventSchema.index({ linkId: 1, timestamp: -1 });

const ClickEvent = mongoose.model<IClickEvent>('ClickEvent', clickEventSchema);

export default ClickEvent;
