import { PrismaClient } from '@prisma/client'

// Reuse a single PrismaClient instance (important with --watch / hot reload).
export const prisma = globalThis.__prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalThis.__prisma = prisma
