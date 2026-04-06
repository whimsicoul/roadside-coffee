import { prisma } from '../lib/prisma';

export class MenuService {
  async getAll() {
    return prisma.menuItem.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getById(id: number) {
    const item = await prisma.menuItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new Error('Menu item not found');
    }

    return item;
  }
}

export const menuService = new MenuService();
