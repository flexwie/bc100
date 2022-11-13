/*
  Warnings:

  - You are about to drop the column `is_onboarded` on the `Organisation` table. All the data in the column will be lost.
  - Added the required column `name` to the `Organisation` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Organisation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "external_id" TEXT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_Organisation" ("external_id", "id") SELECT "external_id", "id" FROM "Organisation";
DROP TABLE "Organisation";
ALTER TABLE "new_Organisation" RENAME TO "Organisation";
CREATE UNIQUE INDEX "Organisation_external_id_key" ON "Organisation"("external_id");
CREATE UNIQUE INDEX "Organisation_name_key" ON "Organisation"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
