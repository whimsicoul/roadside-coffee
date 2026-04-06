import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import authRouter from './auth.routes';
import usersRouter from './users.routes';
import ordersRouter from './orders.routes';
import subscriptionsRouter from './subscriptions.routes';
import menuRouter from './menu.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', authenticate, usersRouter);
router.use('/orders', authenticate, ordersRouter);
router.use('/subscriptions', authenticate, subscriptionsRouter);
router.use('/menu', menuRouter);

export default router;
