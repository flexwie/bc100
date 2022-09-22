import { Authenticator } from "remix-auth";
import { sessionStorage } from "./session.server";
import { MicrosoftStrategy } from "remix-auth-microsoft";
import { prisma } from "./prisma.server";
import { odata } from "@azure/data-tables";
import { User } from "@prisma/client";

export const authenticator = new Authenticator<User>(sessionStorage, {
  sessionErrorKey: "x-login-error",
  throwOnError: true,
});

let microsoftStrategy = new MicrosoftStrategy(
  {
    clientID: process.env.CLIENT_ID!,
    clientSecret: process.env.CLIENT_SECRET!,
    callbackURL: process.env.CALLBACK_URL!,
    scope: "openid profile email", // optional
    prompt: "login", // optional
  },
  async ({ accessToken, extraParams, profile }) => {
    // let user = await prisma.user.findUnique({
    //   where: { external_id: profile.id },
    // });
    // if (user) {
    //   return user;
    // }

    // user = await prisma.user.create({
    //   data: {
    //     name: profile.displayName,
    //     external_id: profile.id,
    //     mail: profile.emails[0].value,
    //   },
    // });
    // return user;

    return await prisma.user.upsert({
      create: {
        name: profile.displayName,
        external_id: profile.id,
        mail: profile.emails[0].value,
      },
      update: { name: profile.displayName, mail: profile.emails[0].value },
      where: { external_id: profile.id },
    });
  }
);

authenticator.use(microsoftStrategy);
