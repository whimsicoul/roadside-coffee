import { Request, Response } from 'express';
import { usersService } from '../services/users.service';

export class UsersController {
  async getProfile(req: Request, res: Response) {
    try {
      const user = await usersService.getProfile(req.user!.id);
      res.status(200).json(user);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const { first_name, last_name, phone, license_plate } = req.body;

      const user = await usersService.updateProfile(req.user!.id, {
        first_name,
        last_name,
        phone,
        license_plate,
      });

      res.status(200).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const usersController = new UsersController();
