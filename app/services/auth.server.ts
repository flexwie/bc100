import { Authenticator } from "remix-auth";
import { sessionStorage } from "./session.server";
import { MicrosoftStrategy } from "remix-auth-microsoft";
import { exclude, prisma } from "./prisma.server";
import { User } from "@prisma/client";
import fetch from "node-fetch";

export const authenticator = new Authenticator<User>(sessionStorage, {
  sessionErrorKey: "x-login-error",
  throwOnError: true,
});

let microsoftStrategy = new MicrosoftStrategy(
  {
    clientID: process.env.CLIENT_ID!,
    clientSecret: process.env.CLIENT_SECRET!,
    callbackURL: process.env.CALLBACK_URL!,
    scope: "openid profile email User.Read", // optional
    prompt: "login", // optional
  },
  async ({ accessToken, extraParams, profile }) => {
    const res = await fetch(
      "https://graph.microsoft.com/v1.0/me/photos/240x240/$value",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const content: Buffer = await res.buffer();
    const base64pic = content.toString("base64");

    const result = await prisma.user.upsert({
      create: {
        name: profile.displayName,
        external_id: profile.id,
        mail: profile.emails[0].value,
        picture: {
          create: {
            data: base64pic,
          },
        },
      },
      update: { name: profile.displayName, mail: profile.emails[0].value },
      where: { external_id: profile.id },
      include: { organisation: true },
    });

    return result;
  }
);

authenticator.use(microsoftStrategy);
