/*
  Warnings:

  - You are about to drop the `Test` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Test";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "mail" TEXT NOT NULL,
    "external_id" TEXT,
    "organisation_id" INTEGER,
    "spending_target" DECIMAL NOT NULL DEFAULT 0,
    "is_onboarded" BOOLEAN NOT NULL DEFAULT false,
    "origin" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "User_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "Organisation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("external_id", "id", "is_onboarded", "mail", "name", "organisation_id", "spending_target") SELECT "external_id", "id", "is_onboarded", "mail", "name", "organisation_id", "spending_target" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_external_id_key" ON "User"("external_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
