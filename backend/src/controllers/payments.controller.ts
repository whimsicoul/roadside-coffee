import { Request, Response } from 'express';
import { paymentsService } from '../services/payments.service';

export class PaymentsController {
  async createIntent(req: Request, res: Response) {
    try {
      const { amount_cents } = req.body;
      const result = await paymentsService.createPaymentIntent(amount_cents);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const paymentsController = new PaymentsController();
