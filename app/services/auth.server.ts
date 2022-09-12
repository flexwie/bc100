import {Authenticator} from 'remix-auth'
import {sessionStorage} from './session.server'
import { MicrosoftStrategy } from "remix-auth-microsoft"
import { prisma } from './prisma.server';
import { odata } from '@azure/data-tables';
import { User } from '@prisma/client';

export const authenticator = new Authenticator<User>(sessionStorage)

let microsoftStrategy = new MicrosoftStrategy(
    {
      clientID: "3756071d-bfc5-4af3-b44a-f781cb89e2b1",
      clientSecret: "rBc8Q~hPQ_5Edjjh5FTawtCL6xsRxQzLbV3L_dl3",
      callbackURL: "http://localhost:3000/auth/callback",
      scope: "openid profile email", // optional
      prompt: "login", // optional
    },
    async ({ accessToken, extraParams, profile }) => {
      let user = await prisma.user.findUnique({ where: { externalId: profile.id } })
      if(user) {
        return user
      }

      user = await prisma.user.create({ data: { name: profile.displayName, externalId: profile.id, mail: profile.emails[0].value } })
      return user
    }
  );
  
  authenticator.use(microsoftStrategy);