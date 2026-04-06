import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../lib/prisma';

export class SubscriptionsService {
  async getActiveSubscription(userId: number) {
    const subscription = await prisma.subscription.findUnique({
      where: { user_id: userId },
    });

    if (!subscription) {
      return null;
    }

    const now = new Date();
    if (subscription.end_date < now) {
      // Subscription has expired
      return null;
    }

    return subscription;
  }

  async createSubscription(
    userId: number,
    start_date: Date,
    end_date: Date,
    weekly_allowance: number,
    default_items?: any[]
  ) {
    // Check if user already has an active subscription
    const existing = await prisma.subscription.findUnique({
      where: { user_id: userId },
    });

    if (existing) {
      throw new Error('User already has an active subscription');
    }

    const subscription = await prisma.subscription.create({
      data: {
        user_id: userId,
        start_date,
        end_date,
        weekly_allowance: new Decimal(weekly_allowance),
        default_items: default_items || null,
      },
    });

    // Update user subscription_status
    await prisma.user.update({
      where: { id: userId },
      data: { subscription_status: 'active' },
    });

    return subscription;
  }

  async updateSubscription(
    userId: number,
    data: {
      start_date?: Date;
      end_date?: Date;
      weekly_allowance?: number;
      default_items?: any[];
    }
  ) {
    const subscription = await prisma.subscription.update({
      where: { user_id: userId },
      data: {
        ...data,
        ...(data.weekly_allowance && {
          weekly_allowance: new Decimal(data.weekly_allowance),
        }),
      },
    });

    return subscription;
  }

  async cancelSubscription(userId: number) {
    // Delete the subscription
    await prisma.subscription.delete({
      where: { user_id: userId },
    });

    // Update user subscription_status
    await prisma.user.update({
      where: { id: userId },
      data: { subscription_status: 'inactive' },
    });

    return { message: 'Subscription cancelled' };
  }
}

export const subscriptionsService = new SubscriptionsService();
