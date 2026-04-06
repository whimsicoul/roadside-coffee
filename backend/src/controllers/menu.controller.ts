import { Request, Response } from 'express';
import { menuService } from '../services/menu.service';

export class MenuController {
  async getAll(req: Request, res: Response) {
    try {
      const items = await menuService.getAll();
      res.status(200).json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const item = await menuService.getById(parseInt(req.params.id));
      res.status(200).json(item);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}

export const menuController = new MenuController();
