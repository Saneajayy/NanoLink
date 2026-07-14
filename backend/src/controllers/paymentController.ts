import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import User from '../models/User';

const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder'
  });
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const razorpay = getRazorpayInstance();

    // Hardcoded amount for MVP: $9.99/mo roughly = 800 INR
    const options = {
      amount: 800 * 100, // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_order_${user._id}`,
    };

    const order = await razorpay.orders.create(options);
    if (!order) {
      res.status(500).json({ message: 'Failed to create Razorpay order' });
      return;
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// export function 
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const user = (req as any).user;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder')
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Upgrade user plan
      await User.findByIdAndUpdate(user._id, { plan: 'core' });
      res.json({ message: 'Payment verified and plan upgraded successfully' });
    } else {
      res.status(400).json({ message: 'Invalid payment signature' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const razorpayWebhook = async (req: Request, res: Response) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret';
    const signature = req.headers['x-razorpay-signature'] as string;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      res.status(400).json({ message: 'Invalid webhook sign' });
      return;
    }

    const event = req.body.event;
    // For MVP we just handle standard one-time payments for upgrade
    if (event === 'payment.captured') {
      const payment = req.body.payload.payment.entity;
      // In a real app we'd link payment.notes.userId or find user by email
      // Example: 
      // const userEmail = payment.email;
      // await User.findOneAndUpdate({ email: userEmail }, { plan: 'core' });
    }

    res.json({ status: 'ok' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
