import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

let _client: PrismaClient | undefined;

function getClient(): PrismaClient {
  if (_client) return _client;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");

  const adapter = new PrismaPg({ connectionString });
  _client = new PrismaClient({ adapter });
  return _client;
}

// Proxy lazy: o PrismaClient só é instanciado na primeira chamada real,
// nunca durante o import em build time.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return getClient()[prop as keyof PrismaClient];
  },
});

export default prisma;
