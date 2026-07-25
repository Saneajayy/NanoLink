import mongoose from 'mongoose';

const clickEventSchema = new mongoose.Schema({
  linkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Link',
    index: true,
    required: true
  },
  qrCodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QrCode',
    default: null // Populated only if this event came from a QR scan
  },
  type: {
    type: String,
    enum: ['click', 'scan'],
    required: true,
    default: 'click'
  },
  timestamp: {
    type: Date,
    index: true,
    default: Date.now
  },
  referrer: {
    type: String,
    default: 'Direct'
  },
  country: {
    type: String,
    default: 'Unknown'
  },
  device: {
    type: String,
    enum: ['mobile', 'desktop', 'tablet', 'other'],
    default: 'other'
  },
  browser: {
    type: String,
    default: 'Other'
  },
  ipHash: {
    type: String,
    default: '' // Hashed for privacy, never store raw IP
  }
}, {
  timestamps: false // Using timestamp field explicitly
});

// Required compound index per Section 3 & Section 8 point 7 for high-performance analytics queries
clickEventSchema.index({ linkId: 1, timestamp: -1 });

const ClickEvent = mongoose.models.ClickEvent || mongoose.model('ClickEvent', clickEventSchema);
export default ClickEvent;
