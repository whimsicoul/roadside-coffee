import { Router } from 'express';
import { z } from 'zod';
import { subscriptionsController } from '../controllers/subscriptions.controller';
import { validate } from '../middleware/validate';

const router = Router();

const createSubscriptionSchema = z.object({
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  weekly_allowance: z.number().positive(),
  default_items: z
    .array(
      z.object({
        menu_item_id: z.number().int().positive(),
        quantity: z.number().int().positive(),
      })
    )
    .optional(),
});

const updateSubscriptionSchema = z.object({
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  weekly_allowance: z.number().positive().optional(),
  default_items: z
    .array(
      z.object({
        menu_item_id: z.number().int().positive(),
        quantity: z.number().int().positive(),
      })
    )
    .optional(),
});

router.get('/me', (req, res) =>
  subscriptionsController.getSubscription(req, res)
);

router.post('/', validate(createSubscriptionSchema), (req, res) =>
  subscriptionsController.createSubscription(req, res)
);

router.put('/me', validate(updateSubscriptionSchema), (req, res) =>
  subscriptionsController.updateSubscription(req, res)
);

router.delete('/me', (req, res) =>
  subscriptionsController.cancelSubscription(req, res)
);

export default router;
