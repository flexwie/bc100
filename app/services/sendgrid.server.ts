import * as sg from "@sendgrid/mail";

sg.setApiKey(process.env.SENDGRID_API_KEY!);

export const sendInvite = async (mail: string) => {
  const msg = {
    to: mail,
    from: "mail@felixwie.com", // Change to your verified sender
    subject: "Sending with SendGrid is Fun",
    text: "and easy to do anywhere, even with Node.js",
    html: "<strong>and easy to do anywhere, even with Node.js</strong>",
  };

  await sg.send(msg);
};
