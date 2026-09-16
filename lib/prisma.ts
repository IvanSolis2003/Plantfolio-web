import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const global_ = globalThis as unknown as { prisma: PrismaClient | undefined };

function crearCliente() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Falta la variable de entorno DATABASE_URL");
  }
  return new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });
}

export const prisma = global_.prisma ?? crearCliente();

if (process.env.NODE_ENV !== "production") {
  global_.prisma = prisma;
}
