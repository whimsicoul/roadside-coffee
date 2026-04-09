import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ordersService } from '../services/orders.service';
import { env } from '../config/env';

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

  async createGuestOrder(req: Request, res: Response) {
    try {
      const {
        first_name,
        last_name,
        email,
        phone,
        license_plate,
        items,
        total_amount,
        stripe_payment_intent_id,
        ready_time,
      } = req.body;

      const order = await ordersService.createGuestOrder(
        { first_name, last_name, email, phone, license_plate },
        items,
        total_amount,
        stripe_payment_intent_id,
        ready_time ? new Date(ready_time) : undefined
      );

      // Issue a short-lived guest token for order tracking and account linking
      const guestToken = jwt.sign(
        { sub: order.id, guestEmail: email, type: 'guest_order' },
        env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({ order, guestToken });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async claimGuestOrder(req: Request, res: Response) {
    try {
      const order = await ordersService.linkGuestOrderToUser(
        parseInt(req.params.id),
        req.user!.id
      );
      res.status(200).json(order);
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
