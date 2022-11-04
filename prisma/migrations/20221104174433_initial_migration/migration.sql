-- CreateTable
CREATE TABLE "Organisation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "external_id" TEXT,
    "is_onboarded" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "mail" TEXT NOT NULL,
    "external_id" TEXT,
    "organisation_id" INTEGER,
    "spending_target" DECIMAL NOT NULL DEFAULT 0,
    CONSTRAINT "User_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "Organisation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Journey" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME,
    "cost" DECIMAL NOT NULL,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "Journey_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "azure_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "sas_url" TEXT,
    "journey_id" INTEGER NOT NULL,
    CONSTRAINT "Attachment_journey_id_fkey" FOREIGN KEY ("journey_id") REFERENCES "Journey" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Test" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Data" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_external_id_key" ON "Organisation"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_external_id_key" ON "User"("external_id");
