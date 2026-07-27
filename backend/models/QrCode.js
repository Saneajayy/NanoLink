import mongoose from 'mongoose';

const qrCodeSchema = new mongoose.Schema({
  linkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Link',
    index: true,
    default: null
  },
  destinationUrl: {
    type: String,
    default: null
  },
  title: {
    type: String,
    default: null
  },
  isDynamic: {
    type: Boolean,
    default: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  }, // Data URI (Base64 PNG) or hosted image URL
  color: {
    type: String,
    default: '#000000'
  }, // Available on both Free and Core plans
  pattern: {
    type: String,
    default: null
  }, // Core only — e.g. 'square', 'dots', 'rounded'
  cornerStyle: {
    type: String,
    default: null
  }, // Core only
  frame: {
    type: String,
    default: null
  }, // Core only — e.g. 'none', 'scan-me', 'custom-text'
  totalScans: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index per Section 8 for fast gallery listing by user
qrCodeSchema.index({ owner: 1, createdAt: -1 });

const QrCode = mongoose.models.QrCode || mongoose.model('QrCode', qrCodeSchema);
export default QrCode;
