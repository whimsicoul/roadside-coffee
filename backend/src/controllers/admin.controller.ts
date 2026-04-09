import { Request, Response } from 'express';
import { adminService } from '../services/admin.service';

export class AdminController {
  // ── Menu ────────────────────────────────────────────────────────────────

  async createMenuItem(req: Request, res: Response): Promise<void> {
    try {
      const { name, price, description } = req.body;
      const item = await adminService.createMenuItem({ name, price, description });
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateMenuItem(req: Request, res: Response): Promise<void> {
    try {
      const { name, price, description } = req.body;
      const item = await adminService.updateMenuItem(parseInt(req.params.id as string), {
        name,
        price,
        description,
      });
      res.status(200).json(item);
    } catch (error: any) {
      const status = error.message === 'Menu item not found' ? 404 : 400;
      res.status(status).json({ error: error.message });
    }
  }

  async deleteMenuItem(req: Request, res: Response): Promise<void> {
    try {
      await adminService.deleteMenuItem(parseInt(req.params.id as string));
      res.status(204).send();
    } catch (error: any) {
      const status = error.message === 'Menu item not found' ? 404 : 400;
      res.status(status).json({ error: error.message });
    }
  }

  // ── Orders ───────────────────────────────────────────────────────────────

  async getAllOrders(req: Request, res: Response): Promise<void> {
    try {
      const { status, page, limit } = req.query;
      const result = await adminService.getAllOrders({
        status: status as string | undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.body;
      const order = await adminService.updateOrderStatus(parseInt(req.params.id as string), status);
      res.status(200).json(order);
    } catch (error: any) {
      const httpStatus = error.message === 'Order not found' ? 404 : 400;
      res.status(httpStatus).json({ error: error.message });
    }
  }
}

export const adminController = new AdminController();
