import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import PLAN_LIMITS from '../constants/planLimits.js';

// Helper to check if Razorpay API keys are configured
const hasRazorpayKeys = () => {
  return process.env.RAZORPAY_KEY_ID && 
         process.env.RAZORPAY_KEY_SECRET && 
         process.env.RAZORPAY_KEY_ID !== 'rzp_test_xxxxxx' &&
         !process.env.RAZORPAY_KEY_ID.includes('placeholder');
};

// @desc    Create Razorpay Order for Core Plan checkout per Section 7
// @route   POST /api/billing/create-order
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const user = req.user;
    if (user.plan === 'core') {
      return res.status(400).json({ error: 'You are already subscribed to the Core plan.' });
    }

    const amount = 75000; // ₹750 in paise (or equivalent USD)
    const currency = 'INR';
    const receipt = `rzp_${user._id.toString().substring(0, 8)}_${Date.now()}`;

    let orderId;
    let keyId;
    let isMock = false;

    if (hasRazorpayKeys()) {
      const rzp = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });

      const order = await rzp.orders.create({
        amount,
        currency,
        receipt,
        notes: { userId: user._id.toString(), plan: 'core' }
      });

      orderId = order.id;
      keyId = process.env.RAZORPAY_KEY_ID;
    } else {
      // Zero-config local development fallback per Section 7
      orderId = `order_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      keyId = 'rzp_test_mock_zero_config_key';
      isMock = true;
      console.log(`💡 Razorpay keys not configured. Created mock order "${orderId}" for local zero-config testing.`);
    }

    // Save payment intent in DB
    await Payment.create({
      userId: user._id,
      razorpayOrderId: orderId,
      amount,
      currency,
      status: 'created'
    });

    res.status(201).json({
      orderId,
      amount,
      currency,
      keyId,
      isMock,
      user: {
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({ error: 'Failed to initiate payment checkout order.' });
  }
};

// @desc    Verify Razorpay payment signature & upgrade user plan per Section 7
// @route   POST /api/billing/verify-payment
// @access  Private
export const verifyPayment = async (req, res) => {
  try {
    const user = req.user;
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, isMock } = req.body;

    if (!razorpayOrderId) {
      return res.status(400).json({ error: 'Missing required payment order ID.' });
    }

    const payment = await Payment.findOne({ razorpayOrderId, userId: user._id });
    if (!payment) {
      return res.status(404).json({ error: 'Payment transaction record not found.' });
    }

    // Verify HMAC SHA256 signature if real Razorpay keys are active per Section 7
    if (!isMock && hasRazorpayKeys()) {
      if (!razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({ error: 'Missing payment ID or signature for verification.' });
      }

      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        payment.status = 'failed';
        await payment.save();
        return res.status(400).json({ error: 'Payment signature verification failed. Possible tampering detected.' });
      }
    } else if (!isMock && !hasRazorpayKeys()) {
      // If client sent !isMock but backend is in mock mode
      console.log('💡 Verifying mock payment in zero-config dev mode.');
    }

    // Upgrade user plan to core
    user.plan = 'core';
    await user.save();

    // Mark payment transaction as paid
    payment.status = 'paid';
    payment.razorpayPaymentId = razorpayPaymentId || `pay_mock_${Date.now()}`;
    await payment.save();

    res.json({
      success: true,
      message: 'Payment verified successfully! Welcome to the Core plan.',
      user: user.toJSON(),
      transaction: payment
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Server error while verifying payment.' });
  }
};

// @desc    Downgrade subscription back to Free tier per Section 6.10
// @route   POST /api/billing/downgrade
// @access  Private
export const downgradePlan = async (req, res) => {
  try {
    const user = req.user;
    if (user.plan === 'free') {
      return res.status(400).json({ error: 'You are already on the Free plan.' });
    }

    user.plan = 'free';
    await user.save();

    res.json({
      success: true,
      message: 'Your subscription has been downgraded to the Free plan.',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Downgrade plan error:', error);
    res.status(500).json({ error: 'Server error downgrading subscription.' });
  }
};

// @desc    Get user billing status, plan quotas, and payment history per Section 6.10
// @route   GET /api/billing/status
// @access  Private
export const getBillingStatus = async (req, res) => {
  try {
    const user = req.user;
    const limitConfig = PLAN_LIMITS[user.plan] || PLAN_LIMITS.free;

    const history = await Payment.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      plan: user.plan,
      limits: limitConfig,
      quotas: {
        linksUsed: user.monthlyLinkCount,
        linksLimit: limitConfig.linksPerMonth,
        customBackHalvesUsed: user.monthlyCustomBackHalfCount,
        customBackHalvesLimit: limitConfig.customBackHalvesPerMonth,
        qrCodesUsed: user.monthlyQrCodeCount,
        qrCodesLimit: limitConfig.qrCodesPerMonth
      },
      history: history.map(h => ({
        _id: h._id,
        orderId: h.razorpayOrderId,
        paymentId: h.razorpayPaymentId,
        amount: h.amount / 100, // convert paise to rupees
        currency: h.currency,
        status: h.status,
        date: h.createdAt
      })),
      hasKeysConfigured: hasRazorpayKeys()
    });
  } catch (error) {
    console.error('Get billing status error:', error);
    res.status(500).json({ error: 'Server error loading billing profile.' });
  }
};

// @desc    Razorpay asynchronous webhook handler per Section 7
// @route   POST /api/billing/webhook
// @access  Public (protected via webhook secret signature)
export const handleWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      return res.status(200).send('Webhook secret not configured.');
    }

    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.warn('⚠️ Webhook signature mismatch.');
      return res.status(400).send('Invalid signature');
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured' || event === 'order.paid') {
      const orderId = payload?.payment?.entity?.order_id || payload?.order?.entity?.id;
      if (orderId) {
        const payment = await Payment.findOne({ razorpayOrderId: orderId });
        if (payment && payment.status !== 'paid') {
          payment.status = 'paid';
          if (payload?.payment?.entity?.id) {
            payment.razorpayPaymentId = payload.payment.entity.id;
          }
          await payment.save();

          const user = await User.findById(payment.userId);
          if (user && user.plan !== 'core') {
            user.plan = 'core';
            await user.save();
            console.log(`🎉 Webhook automatically upgraded user ${user.email} to Core.`);
          }
        }
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Webhook error');
  }
};

export default {
  createOrder,
  verifyPayment,
  downgradePlan,
  getBillingStatus,
  handleWebhook
};
