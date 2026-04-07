import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../lib/prisma';

interface OrderItem {
  menu_item_id: number;
  quantity: number;
}

export class OrdersService {
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

    // Enrich items with menu item details
    const enrichedItems = await Promise.all(
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

  async updateOrderStatus(orderId: number, status: string) {
    if (!['pending', 'arrived', 'ready', 'completed'].includes(status)) {
      throw new Error('Invalid status');
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return order;
  }

  async checkInOrder(orderId: number, userId: number) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        user_id: userId,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'pending') {
      throw new Error('Order cannot be checked in at this stage');
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'arrived' },
    });

    return updatedOrder;
  }
}

export const ordersService = new OrdersService();
