import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import authRouter from './auth.routes';
import usersRouter from './users.routes';
import ordersRouter from './orders.routes';
import guestOrdersRouter from './guestOrders.routes';
import subscriptionsRouter from './subscriptions.routes';
import menuRouter from './menu.routes';
import paymentsRouter from './payments.routes';
import adminRouter from './admin.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/menu', menuRouter);
router.use('/payments', paymentsRouter);                    // public — no auth
router.use('/orders/guest', guestOrdersRouter);            // public — must come BEFORE authenticated orders
router.use('/users', authenticate, usersRouter);
router.use('/orders', authenticate, ordersRouter);
router.use('/subscriptions', authenticate, subscriptionsRouter);
router.use('/admin', authenticate, requireAdmin, adminRouter);

export default router;
