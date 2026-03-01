import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const isDev = process.env.NODE_ENV !== 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

globalThis.__prisma ??= new PrismaClient({
  adapter,
  log: isDev ? ['query', 'warn', 'error'] : ['warn', 'error'],
});

export default globalThis.__prisma;






