import { Journey } from "@prisma/client";
import { DateTime } from "luxon";
import { prisma } from "./prisma.server";
import { BlobServiceClient, BlobSASPermissions } from "@azure/storage-blob";
import { v4 as uuid } from "uuid";
import { UploadHandler } from "@remix-run/node";
import * as joi from "joi";
import { isValid, endOfDay } from "date-fns";

const dateValidator = (v: any, helper: any) => {
  const tempDate = new Date(v);
  if (isValid(tempDate)) return tempDate;
  throw new Error(`date is not valid: ${v}`);
};

const createSchema = joi.object({
  description: joi.string().required(),
  start_date: joi.string().custom(dateValidator).required(),
  end_date: joi.string().custom(dateValidator),
  cost: joi.number().required().min(0),
  attachment: joi.any(),
});

export const addJourney = async (
  data: FormData,
  userId: number
): Promise<Journey> => {
  const parsedData = Object.fromEntries(data);
  const validatedData = createSchema.validate(parsedData, { convert: true });

  console.log(validatedData);

  if (validatedData.error) throw new Error(validatedData.error.message);

  const { description, start_date, end_date, cost, attachment } =
    validatedData.value;

  const roundedCost =
    Math.round((parseFloat(cost) + Number.EPSILON) * 100) / 100;

  console.log({
    data: {
      description,
      start_date,
      end_date,
      cost: roundedCost,
      user_id: userId,
    },
  });

  const j = await prisma.journey.create({
    data: {
      description,
      start_date,
      end_date,
      cost: roundedCost,
      user_id: userId,
    },
  });

  if (attachment) {
    const attachmentData: { id: string; filename: string } =
      JSON.parse(attachment);

    await prisma.attachment.create({
      data: {
        filename: attachmentData.filename,
        azure_id: attachmentData.id,
        journey_id: j.id,
      },
    });
  }

  return j;
};

export const deleteJourney = async (jId: number, userId: number) => {
  const deleteAttachments = prisma.attachment.deleteMany({
    where: { journey_id: jId },
  });
  const deleteJourney = prisma.journey.deleteMany({
    where: { id: jId, user_id: userId },
  });

  return await prisma.$transaction([deleteAttachments, deleteJourney]);
};

export const uploadFile: UploadHandler = async ({ data, name, filename }) => {
  if (name != "attachment") {
    const chunks = [];
    for await (const c of data) chunks.push(c);
    const buffer = Buffer.concat(chunks);

    return buffer.toString();
  }

  const id = uuid();

  const service = BlobServiceClient.fromConnectionString(
    process.env.AZURE_CONNTECTION_STRING!
  );
  const client = service.getContainerClient("bc100").getBlockBlobClient(id);

  const chunks = [];
  for await (const c of data) chunks.push(c);
  const buffer = Buffer.concat(chunks);

  if (buffer.length == 0) return null;

  client.uploadData(buffer);

  return JSON.stringify({ id, filename });
};

export const getSAS = async (id: string) => {
  const service = BlobServiceClient.fromConnectionString(
    process.env.AZURE_CONNTECTION_STRING!
  );
  const client = service.getContainerClient("bc100").getBlockBlobClient(id);

  return await client.generateSasUrl({
    expiresOn: endOfDay(new Date()),
    permissions: BlobSASPermissions.parse("ra"),
  });
};
