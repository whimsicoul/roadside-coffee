import cron from 'node-cron';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

function parseTimeToChronExpression(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  return `${minutes} ${hours} * * *`;
}

function getStartOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function getStartOfTomorrow(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  return d;
}

/**
 * Returns the Monday of the ISO week that `date` falls in.
 * Used to detect when a new billing week starts relative to subscription.start_date.
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = (day === 0 ? -6 : 1 - day); // Monday-based
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
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
      const startOfToday = getStartOfToday();
      const startOfTomorrow = getStartOfTomorrow();

      // Find users with active subscriptions
      const subscriptions = await prisma.subscription.findMany({
        where: {
          end_date: { gte: now },
        },
        include: {
          user: true,
        },
      });

      for (const subscription of subscriptions) {
        // Idempotency guard: skip if we already generated an order today for this subscription
        const existingOrder = await prisma.order.findFirst({
          where: {
            subscription_id: subscription.id,
            created_at: { gte: startOfToday, lt: startOfTomorrow },
          },
        });

        if (existingOrder) {
          console.log(
            `[Subscription Worker] Order already exists for subscription ${subscription.id} today, skipping`
          );
          continue;
        }

        // Weekly reset: if we're in a new billing week, reset used_amount
        const subscriptionWeekStart = getWeekStart(subscription.start_date);
        const currentWeekStart = getWeekStart(now);

        if (currentWeekStart > subscriptionWeekStart) {
          // Check if used_amount is from a previous week by resetting it
          // We track this by seeing if the last order was in a previous week
          const lastOrderThisWeek = await prisma.order.findFirst({
            where: {
              subscription_id: subscription.id,
              created_at: { gte: currentWeekStart },
            },
          });

          if (!lastOrderThisWeek && subscription.used_amount.greaterThan(0)) {
            console.log(
              `[Subscription Worker] Resetting weekly used_amount for subscription ${subscription.id}`
            );
            await prisma.subscription.update({
              where: { id: subscription.id },
              data: { used_amount: new Decimal(0) },
            });
            subscription.used_amount = new Decimal(0);
          }
        }

        // Check if weekly allowance is not exceeded
        if (subscription.used_amount >= subscription.weekly_allowance) {
          console.log(
            `[Subscription Worker] Subscription ${subscription.id} has reached weekly allowance`
          );
          continue;
        }

        // Check if subscription has default items
        if (!subscription.default_items || !Array.isArray(subscription.default_items)) {
          console.log(
            `[Subscription Worker] Subscription ${subscription.id} has no default items`
          );
          continue;
        }

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

          totalAmount = totalAmount.plus(menuItem.price.times(item.quantity));
          enrichedItems.push({
            menu_item_id: item.menu_item_id,
            name: menuItem.name,
            price: menuItem.price.toString(),
            quantity: item.quantity,
          });
        }

        // Build ready_time from pickup_time for today
        // pickup_time is stored as "HH:MM"
        const [hours, minutes] = subscription.pickup_time.split(':').map(Number);
        const readyTime = new Date();
        readyTime.setHours(hours, minutes, 0, 0);

        // Create order tagged with subscription_id and ready_time
        await prisma.order.create({
          data: {
            user_id: subscription.user_id,
            items: enrichedItems,
            total_amount: totalAmount,
            status: 'pending',
            subscription_id: subscription.id,
            ready_time: readyTime,
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
          `[Subscription Worker] Created order for subscription ${subscription.id} (user ${subscription.user_id})`
        );
      }

      console.log('[Subscription Worker] Daily order generation completed');
    } catch (error) {
      console.error('[Subscription Worker] Error:', error);
    }
  });

  console.log('[Subscription Worker] Initialized successfully');
}
