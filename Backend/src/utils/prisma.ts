/*This file creates a single PrismaClient instance
to avoid duplicate connections
and ensure efficient database access across the application.
Singleton pattern*/

import { PrismaClient } from "@prisma/client";

// Extend globalThis to store the PrismaClient instance in development
const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

// Create or reuse the PrismaClient instance (singleton pattern)
// Prisma will automatically use DATABASE_URL for queries and DIRECT_URL for migrations
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error', 'warn'], // Log errors and warnings for debugging
});

// In development, store the instance globally to prevent hot-reload issues
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;