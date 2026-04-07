import { Router } from 'express';
import { z } from 'zod';
import { ordersController } from '../controllers/orders.controller';
import { validate } from '../middleware/validate';

const router = Router();

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      menu_item_id: z.number().int().positive(),
      quantity: z.number().int().positive(),
    })
  ),
  total_amount: z.number().positive(),
  ready_time: z.string().datetime().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'arrived', 'ready', 'completed']),
});

router.get('/', (req, res) => ordersController.getOrders(req, res));

router.post('/', validate(createOrderSchema), (req, res) =>
  ordersController.createOrder(req, res)
);

router.get('/:id', (req, res) => ordersController.getOrder(req, res));

router.patch('/:id/status', validate(updateStatusSchema), (req, res) =>
  ordersController.updateOrderStatus(req, res)
);

router.post('/:id/checkin', (req, res) =>
  ordersController.checkInOrder(req, res)
);

export default router;
