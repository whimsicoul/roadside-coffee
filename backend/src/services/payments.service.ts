// eslint-disable-next-line @typescript-eslint/no-require-imports
const Stripe = require('stripe');
import { env } from '../config/env';

// Stripe v22 ships as a CommonJS module; use require to avoid ESM interop issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripe: any = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-03-31.basil',
});

export class PaymentsService {
  async createPaymentIntent(
    amountCents: number
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });

    if (!paymentIntent.client_secret) {
      throw new Error('Failed to create payment intent');
    }

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  async verifyPaymentIntent(paymentIntentId: string): Promise<boolean> {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent.status === 'succeeded';
  }
}

export const paymentsService = new PaymentsService();
