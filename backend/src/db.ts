import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import process from "process";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});