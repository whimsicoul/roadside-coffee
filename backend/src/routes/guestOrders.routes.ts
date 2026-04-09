import { Router } from 'express';
import { z } from 'zod';
import { ordersController } from '../controllers/orders.controller';
import { validate } from '../middleware/validate';

const router = Router();

export const createGuestOrderSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
  license_plate: z.string().min(2),
  items: z
    .array(
      z.object({
        menu_item_id: z.number().int().positive(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
  total_amount: z.number().positive(),
  ready_time: z.string().datetime().optional(),
  stripe_payment_intent_id: z.string().startsWith('pi_'),
});

router.post('/', validate(createGuestOrderSchema), (req, res) =>
  ordersController.createGuestOrder(req, res)
);

export default router;
