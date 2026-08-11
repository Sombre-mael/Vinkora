import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as typeof globalThis & {
  vinkoraPrisma?: PrismaClient
}

export function getPrisma() {
  if (globalForPrisma.vinkoraPrisma) {
    return globalForPrisma.vinkoraPrisma
  }

  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL is required to initialize Prisma.')
  }

  const adapter = new PrismaNeon({ connectionString })
  const client = new PrismaClient({ adapter })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.vinkoraPrisma = client
  }

  return client
}
