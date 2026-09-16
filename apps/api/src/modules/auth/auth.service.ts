import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { prisma } from '@foodorax/database';
import { RegisterInput, LoginInput } from '@foodorax/validation';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';

@Injectable()
export class AuthService {
  private redis: Redis;

  constructor(private jwtService: JwtService) {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  async register(dto: RegisterInput) {
    const existingUser = await prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const defaultRole = await prisma.role.findUnique({ where: { name: 'CUSTOMER' } });

    const user = await prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        roleId: defaultRole.id,
      },
    });

    return this.generateTokens(user.id, user.email, defaultRole.name);
  }

  async login(dto: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id, user.email, user.role.name);
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
      });

      const storedToken = await this.redis.get(`refresh:${payload.sub}`);
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        include: { role: true },
      });

      return this.generateTokens(user.id, user.email, user.role.name);
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.redis.del(`refresh:${userId}`);
    return { message: 'Successfully logged out' };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'super-secret-key',
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
      expiresIn: '7d',
    });

    // Store Refresh Token in Redis (expires in 7 days)
    await this.redis.set(`refresh:${userId}`, refreshToken, 'EX', 7 * 24 * 60 * 60);

    return { accessToken, refreshToken };
  }
}