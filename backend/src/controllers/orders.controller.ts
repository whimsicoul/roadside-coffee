import { Request, Response } from 'express';
import { ordersService } from '../services/orders.service';

export class OrdersController {
  async createOrder(req: Request, res: Response) {
    try {
      const { items, total_amount, ready_time } = req.body;

      const order = await ordersService.createOrder(
        req.user!.id,
        items,
        total_amount,
        ready_time ? new Date(ready_time) : undefined
      );

      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getOrders(req: Request, res: Response) {
    try {
      const orders = await ordersService.getOrdersByUser(req.user!.id);
      res.status(200).json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getOrder(req: Request, res: Response) {
    try {
      const order = await ordersService.getOrderById(
        parseInt(req.params.id),
        req.user!.id
      );
      res.status(200).json(order);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async updateOrderStatus(req: Request, res: Response) {
    try {
      const { status } = req.body;

      const order = await ordersService.updateOrderStatus(
        parseInt(req.params.id),
        status
      );

      res.status(200).json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async checkInOrder(req: Request, res: Response) {
    try {
      const order = await ordersService.checkInOrder(
        parseInt(req.params.id),
        req.user!.id
      );

      res.status(200).json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const ordersController = new OrdersController();
