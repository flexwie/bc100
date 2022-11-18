import { User, UserPicture } from "@prisma/client";
import {
  ActionFunction,
  json,
  LinksFunction,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import { FunctionComponent, useState } from "react";
import { Button } from "~/components/Button/Button";
import { authenticator } from "~/services/auth.server";
import { prisma } from "~/services/prisma.server";
import { commitSession, getSession } from "~/services/session.server";

type LoaderType = User & { picture: UserPicture };

export default function Onboarding() {
  const data = useLoaderData<LoaderType>();
  const transition = useTransition();

  return (
    <>
      <div className="mb-4">
        <div className="flex sm:flex-row flex-col items-center mb-4">
          <img className="w-36 mb-4 sm:mb-0 sm:mr-4 " src={data.picture.data} />
          <div className="flex flex-col">
            <h2 className="text-center sm:text-left">Hey {data.name}!</h2>
            <p>
              Nice to have you with us. Before you can start to onboard your
              colleagues you need to name your organsiation.
            </p>
          </div>
        </div>
        <Form method="post" action="/onboarding?index">
          <fieldset
            className="grid mb-2"
            disabled={transition.state == "submitting"}
          >
            <label htmlFor="orga_name">Organisation Name</label>
            <Input name="orga_name" />
          </fieldset>

          <fieldset
            className="grid mb-2"
            disabled={transition.state == "submitting"}
          >
            <label htmlFor="invites">Invites</label>
            <Input name="invites" />
          </fieldset>

          <Button text="Let's go" variant="solid" />
        </Form>
      </div>
    </>
  );
}

export const loader: LoaderFunction = async ({ request }) => {
  let user = await authenticator.isAuthenticated(request);
  if (!user) return redirect("/");
  if (user.is_onboarded) return redirect("/dashboard");

  user = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    include: { picture: true },
  });

  return json(user);
};

export const action: ActionFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);
  if (!user) return redirect("/");

  const body = await request.formData();
  const budget = body.get("budget")?.valueOf() || 0;
  const orga_name = body.get("orga_name")?.valueOf();

  if (!orga_name) throw new Error("orga name can't be empty");

  let orga = await prisma.organisation.create({
    data: {
      name: orga_name.toString(),
      admin_id: user.id,
      users: { connect: { id: user.id } },
    },
  });

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { spending_target: parseInt(budget.toString()), is_onboarded: true },
  });

  const session = await getSession(request.headers.get("cookie"));
  session.set(authenticator.sessionKey, updatedUser);
  const headers = new Headers({
    "Set-Cookie": await commitSession(session),
  });

  return redirect("/dashboard", { headers });
};

const Input: FunctionComponent<{ name: string }> = ({ name }) => {
  return (
    <input
      name={name}
      autoComplete="off"
      className="px-2 border-2 rounded border-ciblue-500 active:border-ciblue-500 dark:text-black dark:caret-black"
    />
  );
};
