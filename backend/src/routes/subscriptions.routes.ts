import { Router } from 'express';
import { z } from 'zod';
import { subscriptionsController } from '../controllers/subscriptions.controller';
import { validate } from '../middleware/validate';

const router = Router();

const defaultItemsSchema = z.array(
  z.object({
    menu_item_id: z.number().int().positive(),
    quantity: z.number().int().positive(),
  })
);

const createSubscriptionSchema = z.object({
  tier: z.enum(['drink', 'combo']),
  pickup_time: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format'),
  duration: z.enum(['1w', '1m', '3m']),
  default_items: defaultItemsSchema.min(1),
});

const updateSubscriptionSchema = z.object({
  tier: z.enum(['drink', 'combo']).optional(),
  pickup_time: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format').optional(),
  default_items: defaultItemsSchema.optional(),
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
