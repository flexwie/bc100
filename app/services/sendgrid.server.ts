import { Organisation, User } from "@prisma/client";
import * as sg from "@sendgrid/mail";

sg.setApiKey(process.env.SENDGRID_API_KEY!);

export const sendInvite = async (
  mail: string,
  orga: Organisation,
  admin: User,
  invite_id: number
) => {
  const msg = {
    to: mail,
    from: "mail@felixwie.com", // Change to your verified sender
    subject: "Join BC100",
    html: `<p>${admin.name} invited you to join ${orga.name} on BC100.</p><a href="http://localhost:3000/auth/login?invite=${invite_id}">Join</a>`,
  };

  await sg.send(msg);
};
