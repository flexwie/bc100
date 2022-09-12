import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { externalId: "gkf88vYmfj8QWhU073Zonvrqugrb7d-_XY-btPA3Yso" },
    update: {},
    create: {
      name: "Felix Wieland",
      mail: "WielandF@singhammer.com",
      externalId: "gkf88vYmfj8QWhU073Zonvrqugrb7d-_XY-btPA3Yso",
    },
  });

  const j1 = await prisma.journey.create({
    data: {
      description: "Journey 1",
      start_date: new Date("01.01.2022"),
      end_date: new Date("02.01.2022"),
      cost: 34.44,
      private: false,
      userId: user.id,
    },
  });

  const j2 = await prisma.journey.create({
    data: {
      description: "Journey 2",
      start_date: new Date("01.03.2022"),
      end_date: new Date("02.03.2022"),
      cost: 64.23,
      private: true,
      userId: user.id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
