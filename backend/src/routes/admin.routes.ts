import { Router } from 'express';
import { z } from 'zod';
import { adminController } from '../controllers/admin.controller';
import { validate } from '../middleware/validate';

const router = Router();

// Zod schemas
const createMenuItemSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  description: z.string().optional(),
  category: z.enum(['hot', 'cold', 'food']).optional(),
});

const updateMenuItemSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  description: z.string().optional(),
  category: z.enum(['hot', 'cold', 'food']).optional(),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'ready', 'completed', 'cancelled']),
});

// Menu routes
router.post('/menu', validate(createMenuItemSchema), (req, res) =>
  adminController.createMenuItem(req, res)
);
router.put('/menu/:id', validate(updateMenuItemSchema), (req, res) =>
  adminController.updateMenuItem(req, res)
);
router.delete('/menu/:id', (req, res) =>
  adminController.deleteMenuItem(req, res)
);

// Orders routes
router.get('/orders', (req, res) => adminController.getAllOrders(req, res));
router.patch('/orders/:id/status', validate(updateOrderStatusSchema), (req, res) =>
  adminController.updateOrderStatus(req, res)
);

// Subscriptions routes
router.get('/subscriptions', (req, res) => adminController.getSubscriptions(req, res));

export default router;
