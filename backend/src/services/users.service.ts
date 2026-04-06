import { prisma } from '../lib/prisma';

export class UsersService {
  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        license_plate: true,
        subscription_status: true,
        created_at: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateProfile(
    userId: number,
    data: {
      first_name?: string;
      last_name?: string;
      phone?: string;
      license_plate?: string;
    }
  ) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        license_plate: true,
        subscription_status: true,
        created_at: true,
      },
    });

    return user;
  }
}

export const usersService = new UsersService();
