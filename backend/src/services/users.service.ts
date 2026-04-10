import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

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
        role: true,
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
        role: true,
        created_at: true,
      },
    });

    return user;
  }

  async changeEmail(userId: number, newEmail: string, currentPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const passwordValid = await bcrypt.compare(currentPassword, user.password);
    if (!passwordValid) throw new Error('Current password is incorrect');

    const existing = await prisma.user.findUnique({ where: { email: newEmail } });
    if (existing) throw new Error('Email already in use');

    return prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
      select: {
        id: true, first_name: true, last_name: true, email: true,
        phone: true, license_plate: true, subscription_status: true, role: true, created_at: true,
      },
    });
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const passwordValid = await bcrypt.compare(currentPassword, user.password);
    if (!passwordValid) throw new Error('Current password is incorrect');

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  }

  async deleteAccount(userId: number, password: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) throw new Error('Password is incorrect');

    await prisma.user.delete({ where: { id: userId } });
  }
}

export const usersService = new UsersService();
