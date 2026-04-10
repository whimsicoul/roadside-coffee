import { Request, Response } from 'express';
import { subscriptionsService } from '../services/subscriptions.service';

function computeEndDate(duration: string): Date {
  const end = new Date();
  switch (duration) {
    case '1w':
      end.setDate(end.getDate() + 7);
      break;
    case '1m':
      end.setMonth(end.getMonth() + 1);
      break;
    case '3m':
      end.setMonth(end.getMonth() + 3);
      break;
    default:
      end.setDate(end.getDate() + 7);
  }
  return end;
}

export class SubscriptionsController {
  async getSubscription(req: Request, res: Response) {
    try {
      const subscription = await subscriptionsService.getActiveSubscription(
        req.user!.id
      );

      if (!subscription) {
        res.status(404).json({ error: 'No active subscription' });
        return;
      }

      res.status(200).json(subscription);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createSubscription(req: Request, res: Response) {
    try {
      const { tier, pickup_time, duration, default_items } = req.body;

      const start_date = new Date();
      const end_date = computeEndDate(duration);

      const subscription = await subscriptionsService.createSubscription(
        req.user!.id,
        start_date,
        end_date,
        tier,
        pickup_time,
        default_items
      );

      res.status(201).json(subscription);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateSubscription(req: Request, res: Response) {
    try {
      const { tier, pickup_time, default_items } = req.body;

      const subscription = await subscriptionsService.updateSubscription(
        req.user!.id,
        { tier, pickup_time, default_items }
      );

      res.status(200).json(subscription);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async cancelSubscription(req: Request, res: Response) {
    try {
      const result = await subscriptionsService.cancelSubscription(
        req.user!.id
      );
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const subscriptionsController = new SubscriptionsController();
