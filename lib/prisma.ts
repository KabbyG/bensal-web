import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// `max` is deliberately small: Vercel spins up a fresh connection pool per
// serverless instance, so under concurrent traffic an unbounded (pg's
// default is 10) pool per instance can exhaust a free-tier Postgres
// plan's total connection limit — surfacing as intermittent 500s that
// "fix themselves" on reload. A handful of connections per instance is
// still enough to run a page's parallel queries (e.g. Promise.all in the
// site layout) without serializing them.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 3 });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
