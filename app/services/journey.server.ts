import { Journey } from "@prisma/client";
import { DateTime } from "luxon";
import { prisma } from "./prisma.server";
import { BlobServiceClient } from "@azure/storage-blob";
import { v4 as uuid } from "uuid";
import { UploadHandler } from "@remix-run/node";

export const addJourney = async (
  data: FormData,
  userId: number
): Promise<Journey> => {
  const description: any = data.get("description");
  if (!description) throw new Error("Missing description");

  for (const c in data.values()) console.log(c);

  let start_date: any = data.get("start_date");
  start_date = new Date(start_date);
  if (!start_date) throw new Error("Missing start date");
  if (!DateTime.fromJSDate(start_date).isValid)
    throw new Error("Start date could not be parsed");

  let end_date: any = data.get("end_date");
  end_date = new Date(end_date);
  if (!end_date) throw new Error("Missing end date");
  if (!DateTime.fromJSDate(end_date).isValid)
    throw new Error("End date could not be parsed");

  const cost: any = data.get("cost");
  if (!cost) throw new Error("Missing cost");

  return await prisma.journey.create({
    data: { description, start_date, end_date, cost, userId },
  });
};

export const uploadFile: UploadHandler = async ({ data, name }) => {
  if (name != "attachment") {
    const chunks = [];
    for await (const c of data) chunks.push(c);
    const buffer = Buffer.concat(chunks);

    return buffer.toString();
  }

  const id = uuid();

  const service = BlobServiceClient.fromConnectionString(
    process.env.CONNECTION_STRING!
  );
  const client = service.getContainerClient("bc100").getBlockBlobClient(id);

  const chunks = [];
  for await (const c of data) chunks.push(c);
  const buffer = Buffer.concat(chunks);

  client.uploadData(buffer);

  return id;
};
