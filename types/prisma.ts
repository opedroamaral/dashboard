import type prisma from "@/lib/prisma";

export type TransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];
