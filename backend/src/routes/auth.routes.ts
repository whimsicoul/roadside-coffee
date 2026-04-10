import { Router } from 'express';
import { z } from 'zod';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';

const router = Router();

const registerSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  license_plate: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

router.post('/register', validate(registerSchema), (req, res) =>
  authController.register(req, res)
);

router.post('/login', validate(loginSchema), (req, res) =>
  authController.login(req, res)
);

router.post('/forgot-password', validate(forgotPasswordSchema), (req, res) =>
  authController.forgotPassword(req, res)
);

router.post('/reset-password', validate(resetPasswordSchema), (req, res) =>
  authController.resetPassword(req, res)
);

export default router;
