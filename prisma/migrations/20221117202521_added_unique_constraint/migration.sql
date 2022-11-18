/*
  Warnings:

  - A unique constraint covering the columns `[user_mail]` on the table `Invite` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Invite_user_mail_key" ON "Invite"("user_mail");
