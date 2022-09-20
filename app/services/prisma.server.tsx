import { Attachment, Journey, PrismaClient } from "@prisma/client";
import { getSAS } from "./journey.server";

let prisma: PrismaClient;
declare global {
  var __db: PrismaClient | undefined;
}

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
  prisma.$connect();
} else {
  if (!global.__db) {
    global.__db = new PrismaClient();
    global.__db.$connect();
  }
  prisma = global.__db;
}

prisma.$use(async (params, next) => {
  const result: (Journey & { attachments: Attachment[] })[] = await next(
    params
  );

  if (
    params.model == "Journey" &&
    params.action == "findMany" &&
    params.args.include.attachments == true
  ) {
    for (const r of result) {
      for (const a of r.attachments) {
        const url = await getSAS(a.azure_id);
        a.sas_url = url;
      }
    }

    return result;
  }

  return result;
});

export { prisma };
