import { Invite, Organisation, User, UserPicture } from "@prisma/client";
import {
  ActionFunction,
  json,
  LinksFunction,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { Button } from "~/components/Button/Button";
import { Card } from "~/components/Simple/Card";
import { authenticator, isAdmin } from "~/services/auth.server";
import { prisma } from "~/services/prisma.server";
import { sendInvite } from "~/services/sendgrid.server";

import style from "./index.css";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: style }];

type LoaderReturn = {
  orga: Organisation & {
    users: (User & { picture: UserPicture })[];
    _count: { users: number };
  };
  invites: Invite[];
};

export default function Members() {
  const [showInvite, setShowInvite] = useState(false);

  const data = useLoaderData<LoaderReturn>();

  return (
    <div>
      <h2 className="mb-8">{data.orga.name}</h2>
      <div>
        <a href="/organisation/members">
          <p className="mb-4">Members</p>
        </a>
        <div>
          <ul className="grid grid-cols-1 rounded overflow-hidden shadow-lg w-full bg-ciwhite-100 dark:bg-ciblack-700 mb-8">
            {data.orga.users.map(
              (u, i) =>
                i < 10 && (
                  <Link to={`/organisation/${u.id}`}>
                    <Card>
                      <div className="flex items-center">
                        <img className="w-12 mr-4" src={u.picture.data} />
                        <div>
                          <p>{u.name}</p>
                          <p className="text-slate-500 font-sm">
                            {u.mail.toLowerCase()}
                          </p>
                        </div>
                        <div
                          className={`${
                            u.origin == "github" ? "github" : "aad"
                          } ml-auto mr-4`}
                        />
                      </div>
                    </Card>
                  </Link>
                )
            )}
            {data.invites.map((i) => (
              <Card>
                <div className="flex items-center">
                  <img
                    className="w-12 mr-4"
                    src="data:image/png;base64,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"
                  />
                  <div>
                    <p className="text-slate-500 font-sm">
                      {i.user_mail.toLowerCase()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </ul>
          {data.orga._count.users > 10 && (
            <Form action="/organisation/members" method="get">
              <Button text="See more" variant="solid" />
            </Form>
          )}

          <Button
            text="Invite"
            variant="solid"
            className="transition duration-150"
            click={() => {
              setShowInvite(true);
            }}
          />

          <div
            className={`${
              showInvite ? "visible opacity-100" : "hidden opacity-0"
            } transition duration-1000`}
          >
            <Form action="/organisation?index" method="post">
              <input name="mail" className="text-ciblack-500" />
              <Button text="Invite" variant="solid" />
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);
  if (!isAdmin(user)) return redirect("/");

  const orga = await prisma.organisation.findFirstOrThrow({
    where: { id: user!.organisation_id! },
    include: { users: { include: { picture: true } }, _count: true },
  });
  const invites = await prisma.invite.findMany({
    where: { organisation_id: orga.id },
  });

  return json({ orga, invites });
};

export const action: ActionFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);
  if (!(await isAdmin(user))) return redirect("/");

  const body = await request.formData();
  const mail = body.get("mail")?.valueOf();

  const orga = await prisma.organisation.findUniqueOrThrow({
    where: { id: user!.organisation_id! },
  });
  const invite = await prisma.invite.upsert({
    where: { user_mail: mail!.toString() },
    create: { organisation_id: orga.id, user_mail: mail!.toString() },
    update: {},
  });

  await sendInvite(mail!.toString(), orga, user!, invite.id);

  return null;
};
