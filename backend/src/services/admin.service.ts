import { prisma } from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export class AdminService {
  // ── Menu Management ──────────────────────────────────────────────────────

  async createMenuItem(data: { name: string; price: number; description?: string; category?: string }) {
    return prisma.menuItem.create({
      data: {
        name: data.name,
        price: new Decimal(data.price),
        description: data.description ?? null,
        image_url: null,
        category: data.category ?? null,
      },
    });
  }

  async updateMenuItem(
    id: number,
    data: { name?: string; price?: number; description?: string; category?: string }
  ) {
    const item = await prisma.menuItem.findUnique({ where: { id } });
    if (!item) throw new Error('Menu item not found');

    return prisma.menuItem.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.price !== undefined && { price: new Decimal(data.price) }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.category !== undefined && { category: data.category }),
      },
    });
  }

  async deleteMenuItem(id: number) {
    const item = await prisma.menuItem.findUnique({ where: { id } });
    if (!item) throw new Error('Menu item not found');
    return prisma.menuItem.delete({ where: { id } });
  }

  // ── Order Management ─────────────────────────────────────────────────────

  async getAllOrders(options: { status?: string; date?: string; page?: number; limit?: number }) {
    const { status, date, page = 1, limit = 50 } = options;
    const skip = (page - 1) * limit;

    // Build date range filter if a date is provided
    let dateFilter: { gte?: Date; lt?: Date } | undefined;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      dateFilter = { gte: start, lt: end };
    }

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (dateFilter) where.created_at = dateFilter;

    // Daily summary counts (always scoped to the date range, ignoring status filter)
    const dayWhere: Record<string, unknown> = dateFilter ? { created_at: dateFilter } : {};
    const [orders, total, pendingCount, readyCount, completedCount, cancelledCount, dailyTotalAgg] =
      await Promise.all([
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
        prisma.order.count({ where: { ...dayWhere, status: 'pending' } }),
        prisma.order.count({ where: { ...dayWhere, status: 'ready' } }),
        prisma.order.count({ where: { ...dayWhere, status: 'completed' } }),
        prisma.order.count({ where: { ...dayWhere, status: 'cancelled' } }),
        prisma.order.aggregate({
          where: dayWhere,
          _sum: { total_amount: true },
        }),
      ]);

    const dailyTotal = Number(dailyTotalAgg._sum.total_amount ?? 0);

    return { orders, total, page, limit, pendingCount, readyCount, completedCount, cancelledCount, dailyTotal };
  }

  async updateOrderStatus(id: number, status: string) {
    const validTransitions: Record<string, string[]> = {
      pending: ['ready', 'completed', 'cancelled'],
      ready: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
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
