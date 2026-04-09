import { prisma } from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export class AdminService {
  // ── Menu Management ──────────────────────────────────────────────────────

  async createMenuItem(data: { name: string; price: number; description?: string }) {
    return prisma.menuItem.create({
      data: {
        name: data.name,
        price: new Decimal(data.price),
        description: data.description ?? null,
        image_url: null,
      },
    });
  }

  async updateMenuItem(
    id: number,
    data: { name?: string; price?: number; description?: string }
  ) {
    const item = await prisma.menuItem.findUnique({ where: { id } });
    if (!item) throw new Error('Menu item not found');

    return prisma.menuItem.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.price !== undefined && { price: new Decimal(data.price) }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });
  }

  async deleteMenuItem(id: number) {
    const item = await prisma.menuItem.findUnique({ where: { id } });
    if (!item) throw new Error('Menu item not found');
    return prisma.menuItem.delete({ where: { id } });
  }

  // ── Order Management ─────────────────────────────────────────────────────

  async getAllOrders(options: { status?: string; page?: number; limit?: number }) {
    const { status, page = 1, limit = 50 } = options;
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, first_name: true, last_name: true, email: true },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total, page, limit };
  }

  async updateOrderStatus(id: number, status: string) {
    const validTransitions: Record<string, string[]> = {
      pending: ['arrived', 'ready', 'completed'],
      arrived: ['ready', 'completed'],
      ready: ['completed'],
      completed: [],
    };

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new Error('Order not found');

    const allowed = validTransitions[order.status] ?? [];
    if (!allowed.includes(status)) {
      throw new Error(`Cannot transition from '${order.status}' to '${status}'`);
    }

    return prisma.order.update({ where: { id }, data: { status } });
  }
}

export const adminService = new AdminService();
