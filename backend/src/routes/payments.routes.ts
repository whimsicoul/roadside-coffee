import { Router } from 'express';
import { z } from 'zod';
import { paymentsController } from '../controllers/payments.controller';
import { validate } from '../middleware/validate';

const router = Router();

const createIntentSchema = z.object({
  amount_cents: z.number().int().positive(),
});

router.post('/create-intent', validate(createIntentSchema), (req, res) =>
  paymentsController.createIntent(req, res)
);

export default router;
