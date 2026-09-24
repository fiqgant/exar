import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pool?: Pool;
  schemaVersion?: number;
};
const SCHEMA_VERSION = 3; // Invalidate cached instance when models/adapter changes

function getPool() {
  if (globalForPrisma.pool) {
    return globalForPrisma.pool;
  }

  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });

  globalForPrisma.pool = pool;
  return pool;
}

function createPrismaClient() {
  const pool = getPool();
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma =
  globalForPrisma.prisma && globalForPrisma.schemaVersion === SCHEMA_VERSION
    ? globalForPrisma.prisma
    : (globalForPrisma.prisma = createPrismaClient());

globalForPrisma.schemaVersion = SCHEMA_VERSION;
