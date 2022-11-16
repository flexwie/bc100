-- CreateTable
CREATE TABLE "Invite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_mail" TEXT NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    CONSTRAINT "Invite_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "Organisation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
