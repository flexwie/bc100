import { Authenticator } from "remix-auth";
import { sessionStorage } from "./session.server";
import { MicrosoftStrategy } from "remix-auth-microsoft";
import { prisma } from "./prisma.server";
import { User } from "@prisma/client";
import fetch from "node-fetch";
import { GitHubStrategy } from "remix-auth-github";

export const authenticator = new Authenticator<User>(sessionStorage, {
  sessionErrorKey: "x-login-error",
  throwOnError: true,
});

let githubStrategy = new GitHubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    callbackURL: process.env.GITHUB_CALLBACK_URL!,
  },
  async ({ accessToken, profile }) => {
    const res = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const content = await res.json();

    const result = await prisma.user.upsert({
      create: {
        name: profile.displayName,
        external_id: profile.id,
        mail: profile.emails![0].value,
        origin: "github",
        picture: {
          create: {
            data: content.avatar_url,
          },
        },
      },
      update: { name: profile.displayName, mail: profile.emails![0].value },
      where: { external_id: profile.id },
      include: { organisation: true },
    });

    return result;
  }
);

let microsoftStrategy = new MicrosoftStrategy(
  {
    clientID: process.env.MS_CLIENT_ID!,
    clientSecret: process.env.MS_CLIENT_SECRET!,
    callbackURL: process.env.MS_CALLBACK_URL!,
    scope: "openid profile email User.Read", // optional
    prompt: "login", // optional
  },
  async ({ accessToken, profile }) => {
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
        origin: "aad",
        picture: {
          create: {
            data: `data:image/png;base64, ${base64pic}`,
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

export const isAdmin = async (user: User | null) => {
  if (!user) return false;

  const orga = await prisma.organisation.findFirstOrThrow({
    where: { id: user.organisation_id! },
  });

  return orga.admin_id == user.id;
};

authenticator.use(githubStrategy);
authenticator.use(microsoftStrategy);
