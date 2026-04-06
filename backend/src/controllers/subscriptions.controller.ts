import { Request, Response } from 'express';
import { subscriptionsService } from '../services/subscriptions.service';

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
      const { start_date, end_date, weekly_allowance, default_items } =
        req.body;

      const subscription = await subscriptionsService.createSubscription(
        req.user!.id,
        new Date(start_date),
        new Date(end_date),
        weekly_allowance,
        default_items
      );

      res.status(201).json(subscription);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateSubscription(req: Request, res: Response) {
    try {
      const { start_date, end_date, weekly_allowance, default_items } =
        req.body;

      const subscription = await subscriptionsService.updateSubscription(
        req.user!.id,
        {
          start_date: start_date ? new Date(start_date) : undefined,
          end_date: end_date ? new Date(end_date) : undefined,
          weekly_allowance,
          default_items,
        }
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
