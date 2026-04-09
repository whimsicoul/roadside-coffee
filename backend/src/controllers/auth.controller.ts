import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { first_name, last_name, email, password, phone, license_plate } = req.body;

      const result = await authService.register(
        first_name,
        last_name,
        email,
        password,
        phone,
        license_plate
      );

      res.status(201).json(result);
    } catch (error: any) {
      if (error.code === 'P2002') {
        res.status(409).json({ error: 'Email already registered' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }
}

export const authController = new AuthController();
