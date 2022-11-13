import {
  ActionFunction,
  Headers,
  json,
  LinksFunction,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { prisma } from "~/services/prisma.server";
import { commitSession, getSession } from "~/services/session.server";
import { createActionFunction } from "~/utils/action.server";
import styles from "./settings.css";

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: styles,
  },
];

export default function Settings() {
  const data = useLoaderData();

  return (
    <>
      <div>
        <h2>Target Budget</h2>
        <p>Set the target budget you want to spend each month.</p>
        <Form action="/settings" method="post" className="grid grid-cols-3">
          <input name="target" />
          <button>Submit</button>
        </Form>
        <p>Un-Onboard:</p>
        <Form action="/settings" method="post" className="grid grid-cols-3">
          <input name="is_onboarded" value="false" hidden />
          <button>Submit</button>
        </Form>
        <div>{JSON.stringify(data)}</div>
      </div>
      <div className="hidden">
        <h2>Plan</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-400 border rounded px-2 py-4 flex justify-center">
            <p>Free</p>
            <ul>
              <li>unlimited journeys</li>
              <li>more</li>
            </ul>
          </div>
          <div className="bg-gray-400 border rounded px-2 py-4 flex justify-center">
            <p>Starter</p>
            <ul>
              <li>everthing in free</li>
              <li>webhooks</li>
              <li>reports</li>
              <li>attachments</li>
            </ul>
          </div>
        </div>
      </div>
      <Form method="post" action="/auth/logout">
        <button>Logout</button>
      </Form>
    </>
  );
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);
  if (!user) return redirect("/");

  return user;
};

export const action: ActionFunction = (args) => {
  return createActionFunction(args, {
    onPost: async ({ request }) => {
      const form = await request.formData();
      const data = Object.fromEntries(form);

      const user = await authenticator.isAuthenticated(request);

      const updatedUser = await prisma.user.update({
        data: {
          spending_target: data.target ? data.target.valueOf() : undefined,
          is_onboarded: data.is_onboarded
            ? data.is_onboarded.valueOf() == true
            : undefined,
        },
        where: { id: user?.id },
      });

      const session = await getSession(request.headers.get("cookie"));
      session.set(authenticator.sessionKey, updatedUser);
      const headers = new Headers({
        "Set-Cookie": await commitSession(session),
      });

      return json({ updatedUser }, { headers });
    },
  });
};
