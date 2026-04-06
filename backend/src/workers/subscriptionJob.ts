import cron from 'node-cron';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

function parseTimeToChronExpression(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  return `${minutes} ${hours} * * *`;
}

export function startSubscriptionWorker() {
  const cronExpression = parseTimeToChronExpression(
    env.DAILY_ORDER_GENERATION_TIME
  );

  console.log(
    `[Subscription Worker] Starting at ${env.DAILY_ORDER_GENERATION_TIME} (${cronExpression})`
  );

  cron.schedule(cronExpression, async () => {
    try {
      console.log('[Subscription Worker] Running daily order generation...');

      const now = new Date();

      // Find users with active subscriptions
      const subscriptions = await prisma.subscription.findMany({
        where: {
          end_date: {
            gte: now,
          },
        },
        include: {
          user: true,
        },
      });

      for (const subscription of subscriptions) {
        // Check if weekly allowance is not exceeded
        if (subscription.used_amount >= subscription.weekly_allowance) {
          console.log(
            `[Subscription Worker] User ${subscription.user_id} has reached weekly allowance`
          );
          continue;
        }

        // Check if user has default items
        if (!subscription.default_items || !Array.isArray(subscription.default_items)) {
          console.log(
            `[Subscription Worker] User ${subscription.user_id} has no default items`
          );
          continue;
        }

        // Calculate total amount from default items
        const items = subscription.default_items as Array<{
          menu_item_id: number;
          quantity: number;
        }>;

        let totalAmount = new Decimal(0);
        const enrichedItems = [];

        for (const item of items) {
          const menuItem = await prisma.menuItem.findUnique({
            where: { id: item.menu_item_id },
          });

          if (!menuItem) {
            console.log(
              `[Subscription Worker] Menu item ${item.menu_item_id} not found`
            );
            continue;
          }

          totalAmount = totalAmount.plus(
            menuItem.price.times(item.quantity)
          );
          enrichedItems.push({
            menu_item_id: item.menu_item_id,
            name: menuItem.name,
            price: menuItem.price.toString(),
            quantity: item.quantity,
          });
        }

        // Create order
        await prisma.order.create({
          data: {
            user_id: subscription.user_id,
            items: enrichedItems,
            total_amount: totalAmount,
            status: 'pending',
          },
        });

        // Increment used_amount
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            used_amount: subscription.used_amount.plus(totalAmount),
          },
        });

        console.log(
          `[Subscription Worker] Created order for user ${subscription.user_id}`
        );
      }

      console.log('[Subscription Worker] Daily order generation completed');
    } catch (error) {
      console.error('[Subscription Worker] Error:', error);
    }
  });

  // Log on startup
  console.log('[Subscription Worker] Initialized successfully');
}
