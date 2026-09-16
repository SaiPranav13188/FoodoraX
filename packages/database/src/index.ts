import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development (Hot Reloading fix)
const globalForPrisma = globalThis as unknown as {
  prismaGlobal: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prismaGlobal ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaGlobal = prisma;
}

// Export all Prisma types and the PrismaClient class
export * from '@prisma/client';