import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';

export class AuthService {
  async register(
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    phone?: string,
    license_plate?: string
  ) {
    const password_hash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        first_name,
        last_name,
        email,
        password_hash,
        phone: phone ?? null,
        license_plate: license_plate ?? null,
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    const token = jwt.sign({ userId: user.id, role: 'customer' }, env.JWT_SECRET, {
      expiresIn: '24h',
    });

    return { user, token };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, {
      expiresIn: '24h',
    });

    return {
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  private getMailTransporter() {
    return nodemailer.createTransport({
      host: env.SMTP_SERVER,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
    });
  }

  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) return;

    // Invalidate any existing unused tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { user_id: user.id, used: false },
      data: { used: true },
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expires_at = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { user_id: user.id, token, expires_at },
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const transporter = this.getMailTransporter();
    await transporter.sendMail({
      from: `"Roadside Coffee" <${env.SMTP_USER}>`,
      to: user.email,
      subject: 'Reset your Roadside Coffee password',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #FAF7F2; border-radius: 12px;">
          <h2 style="font-size: 24px; color: #2D1E17; margin-bottom: 8px;">Password reset</h2>
          <p style="color: #6B5C52; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            Hi ${user.first_name}, we received a request to reset your password. Click the button below — this link expires in 1 hour.
          </p>
          <a href="${resetUrl}" style="display: inline-block; background: #6B5C52; color: #FAF7F2; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 15px; font-weight: 600;">
            Reset password
          </a>
          <p style="color: #9E8E84; font-size: 13px; margin-top: 24px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });
  }

  async resetPassword(token: string, newPassword: string) {
    const record = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!record || record.used || record.expires_at < new Date()) {
      throw new Error('Invalid or expired reset token');
    }

    const password_hash = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.user_id },
        data: { password_hash },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { used: true },
      }),
    ]);
  }
}

export const authService = new AuthService();
