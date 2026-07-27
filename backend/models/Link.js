import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  originalUrl: {
    type: String,
    required: true,
    trim: true
  },
  customAlias: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true // Used for soft-delete, never hard-delete a link
  },
  qrCodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QrCode',
    default: null
  },
  createdFromQr: {
    type: Boolean,
    default: false
  },
  utmParams: {
    source: { type: String, default: '' },
    medium: { type: String, default: '' },
    campaign: { type: String, default: '' },
    term: { type: String, default: '' },
    content: { type: String, default: '' }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  safeBrowsingChecked: {
    type: Boolean,
    default: true
  },
  totalClicks: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual property for shortUrl constructed dynamically from backend BASE_URL per Section 9
linkSchema.virtual('shortUrl').get(function() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  return `${baseUrl}/r/${this.slug}`;
});

// Compound indexes per Section 8 for ultra-fast user dashboard listing and soft-delete filtering
linkSchema.index({ owner: 1, createdAt: -1 });
linkSchema.index({ slug: 1, isActive: 1 });

const Link = mongoose.models.Link || mongoose.model('Link', linkSchema);
export default Link;
