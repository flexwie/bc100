-- CreateTable
CREATE TABLE "UserPicture" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "data" TEXT NOT NULL,
    CONSTRAINT "UserPicture_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPicture_user_id_key" ON "UserPicture"("user_id");
