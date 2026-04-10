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

const changeEmailSchema = z.object({
  new_email: z.string().email('Invalid email address'),
  current_password: z.string().min(1, 'Password is required'),
});

const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'Password must be at least 8 characters'),
});

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

router.get('/me', (req, res) => usersController.getProfile(req, res));

router.put('/me', validate(updateProfileSchema), (req, res) =>
  usersController.updateProfile(req, res)
);

router.put('/me/email', validate(changeEmailSchema), (req, res) =>
  usersController.changeEmail(req, res)
);

router.put('/me/password', validate(changePasswordSchema), (req, res) =>
  usersController.changePassword(req, res)
);

router.delete('/me', validate(deleteAccountSchema), (req, res) =>
  usersController.deleteAccount(req, res)
);

export default router;
