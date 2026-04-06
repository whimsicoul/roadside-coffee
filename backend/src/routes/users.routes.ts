import { Router } from 'express';
import { z } from 'zod';
import { usersController } from '../controllers/users.controller';
import { validate } from '../middleware/validate';

const router = Router();

const updateProfileSchema = z.object({
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  phone: z.string().optional(),
  license_plate: z.string().optional(),
});

router.get('/me', (req, res) => usersController.getProfile(req, res));

router.put('/me', validate(updateProfileSchema), (req, res) =>
  usersController.updateProfile(req, res)
);

export default router;
