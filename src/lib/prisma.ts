import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  schemaVersion?: number;
};
const SCHEMA_VERSION = 2; // Invalidate cached instance when schema models change

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma =
  globalForPrisma.prisma && globalForPrisma.schemaVersion === SCHEMA_VERSION
    ? globalForPrisma.prisma
    : new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.schemaVersion = SCHEMA_VERSION;
}
