import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../lib/prisma';
import { paymentsService } from './payments.service';

interface OrderItem {
  menu_item_id: number;
  quantity: number;
}

interface GuestInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  license_plate: string;
}

export class OrdersService {
  private async enrichItems(items: OrderItem[]) {
    return Promise.all(
      items.map(async (item) => {
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: item.menu_item_id },
        });

        if (!menuItem) {
          throw new Error(`Menu item ${item.menu_item_id} not found`);
        }

        return {
          menu_item_id: item.menu_item_id,
          name: menuItem.name,
          price: menuItem.price.toString(),
          quantity: item.quantity,
        };
      })
    );
  }

  async createOrder(
    userId: number,
    items: OrderItem[],
    total_amount: number,
    ready_time?: Date
  ) {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const enrichedItems = await this.enrichItems(items);

    const order = await prisma.order.create({
      data: {
        user_id: userId,
        items: enrichedItems,
        total_amount: new Decimal(total_amount),
        ready_time: ready_time ? new Date(ready_time) : null,
        status: 'pending',
      },
    });

    return order;
  }

  async createGuestOrder(
    guestInfo: GuestInfo,
    items: OrderItem[],
    total_amount: number,
    stripe_payment_intent_id: string,
    ready_time?: Date
  ) {
    // Verify payment succeeded before writing the order
    const paid = await paymentsService.verifyPaymentIntent(stripe_payment_intent_id);
    if (!paid) {
      throw new Error('Payment has not been completed');
    }

    const enrichedItems = await this.enrichItems(items);

    const order = await prisma.order.create({
      data: {
        user_id: null,
        items: enrichedItems,
        total_amount: new Decimal(total_amount),
        status: 'pending',
        ready_time: ready_time ? new Date(ready_time) : null,
        guest_first_name: guestInfo.first_name,
        guest_last_name: guestInfo.last_name,
        guest_email: guestInfo.email,
        guest_phone: guestInfo.phone,
        guest_license_plate: guestInfo.license_plate,
        stripe_payment_intent_id,
      },
    });

    return order;
  }

  async linkGuestOrderToUser(orderId: number, userId: number) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, user_id: null },
    });

    if (!order) {
      throw new Error('Guest order not found');
    }

    return prisma.order.update({
      where: { id: orderId },
      data: { user_id: userId },
    });
  }

  async getOrdersByUser(userId: number) {
    return prisma.order.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  async getOrderById(orderId: number, userId: number) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        user_id: userId,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  async checkInOrder(orderId: number, userId: number) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, user_id: userId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'pending') {
      throw new Error('Only pending orders can be checked in');
    }

    return prisma.order.update({
      where: { id: orderId },
      data: { status: 'arrived' },
    });
  }

  async updateOrderStatus(orderId: number, status: string) {
    if (!['pending', 'ready', 'completed', 'cancelled'].includes(status)) {
      throw new Error('Invalid status');
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return order;
  }
}

export const ordersService = new OrdersService();
