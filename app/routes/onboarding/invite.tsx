import { User, UserPicture } from "@prisma/client";
import {
  ActionFunction,
  json,
  LinksFunction,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import { FunctionComponent } from "react";
import { BahnCard, links as bcStyle } from "~/components/BahnCard/BahnCard";
import { Button } from "~/components/Button/Button";
import { authenticator } from "~/services/auth.server";
import { prisma } from "~/services/prisma.server";
import { commitSession, getSession } from "~/services/session.server";

type LoaderType = User & { picture: UserPicture };

export const links: LinksFunction = () => [...bcStyle()];

export default function Onboarding() {
  const data = useLoaderData<LoaderType>();
  const transition = useTransition();

  return (
    <>
      <div className="prose mb-4">
        <p className="text-red-600">INVITE</p>
        <h2>Hey {data.name}!</h2>
        <img src={`data:image/png;base64, ${data.picture.data}`} />
        <p>
          Nice to have you on board. Please fill out some additional
          information:
        </p>
        <Form method="post" action="/onboarding?index">
          <fieldset
            className="grid grid-cols-2 gap-2 mb-2"
            disabled={transition.state == "submitting"}
          >
            <label htmlFor="budget">Budget</label>
            <Input name="budget" />
          </fieldset>
          <Button text="Let's go" variant="solid" />
        </Form>
      </div>
      <div className="flex">
        <BahnCard />
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
      className="px-2 border-2 rounded border-ciblue-500 active:border-ciblue-500"
    />
  );
};
