import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  schemaVersion?: number;
};
const SCHEMA_VERSION = 2; // Invalidate cached instance when schema models change

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma =
  globalForPrisma.prisma && globalForPrisma.schemaVersion === SCHEMA_VERSION
    ? globalForPrisma.prisma
    : (globalForPrisma.prisma = createPrismaClient());

globalForPrisma.schemaVersion = SCHEMA_VERSION;
