import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set. Add it to .env.local (and restart the dev server).')
  }
  return url
}

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: getDatabaseUrl() })
  const client = new PrismaClient({ adapter })

  // PostgreSQL defaults are conservative for concurrent access from a
  // Node server — set these per-connection at startup.
  // WAL: readers don't block writers and vice versa (default is
  // DELETE mode, which single-locks the whole file per write).
  // busy_timeout: retry internally for N ms instead of throwing
  // SQLITE_BUSY immediately on write contention.
  // foreign_keys: off by default in SQLite; must be enabled per
  // connection or relational constraints are silently unenforced.
  void client.$queryRaw`PRAGMA journal_mode = WAL;`
  void client.$executeRaw`PRAGMA busy_timeout = 5000;`
  void client.$executeRaw`PRAGMA foreign_keys = ON;`

  return client
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// PostgreSQL holds an open connection. Close it on
// process exit so the server doesn't leave dangling connections.
if (process.env.NODE_ENV === 'production') {
  const shutdown = async () => {
    await prisma.$disconnect()
    process.exit(0)
  }
  process.once('SIGINT', shutdown)
  process.once('SIGTERM', shutdown)
}
