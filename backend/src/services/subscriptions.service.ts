import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../lib/prisma';

const TIER_WEEKLY_ALLOWANCE: Record<string, number> = {
  drink: 35,  // $5/day × 7
  combo: 63,  // $9/day × 7
};

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
      return null;
    }

    return subscription;
  }

  async createSubscription(
    userId: number,
    start_date: Date,
    end_date: Date,
    tier: string,
    pickup_time: string,
    default_items?: any[]
  ) {
    const existing = await prisma.subscription.findUnique({
      where: { user_id: userId },
    });

    if (existing) {
      throw new Error('User already has an active subscription');
    }

    const weekly_allowance = TIER_WEEKLY_ALLOWANCE[tier] ?? 35;

    const subscription = await prisma.subscription.create({
      data: {
        user_id: userId,
        tier,
        pickup_time,
        start_date,
        end_date,
        weekly_allowance: new Decimal(weekly_allowance),
        default_items: default_items || null,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { subscription_status: 'active' },
    });

    return subscription;
  }

  async updateSubscription(
    userId: number,
    data: {
      tier?: string;
      pickup_time?: string;
      default_items?: any[];
    }
  ) {
    const updateData: any = { ...data };

    // Recompute weekly_allowance if tier is changing
    if (data.tier && TIER_WEEKLY_ALLOWANCE[data.tier] !== undefined) {
      updateData.weekly_allowance = new Decimal(TIER_WEEKLY_ALLOWANCE[data.tier]);
    }

    const subscription = await prisma.subscription.update({
      where: { user_id: userId },
      data: updateData,
    });

    return subscription;
  }

  async cancelSubscription(userId: number) {
    await prisma.subscription.delete({
      where: { user_id: userId },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { subscription_status: 'inactive' },
    });

    return { message: 'Subscription cancelled' };
  }

  async getAllActiveSubscriptions() {
    const now = new Date();
    return prisma.subscription.findMany({
      where: {
        end_date: { gte: now },
      },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });
  }
}

export const subscriptionsService = new SubscriptionsService();
