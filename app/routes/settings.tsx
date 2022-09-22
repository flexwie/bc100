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
    <main>
      <h1>
        <span className="text-gradient">BC100</span> Settings
      </h1>
      <div>
        <h2>User</h2>
        <div className="flex">
          <div>
            <p>Name</p>
            <p>{data.name}</p>
          </div>
        </div>
      </div>
      <div>
        <Form action="/settings" method="post">
          <input name="target" />
          <button>Submit</button>
        </Form>
      </div>
      <div>
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
    </main>
  );
}

export const loader: LoaderFunction = ({ request }) => {
  const user = authenticator.isAuthenticated(request);
  if (!user) return redirect("/");

  return user;
};

export const action: ActionFunction = (args) => {
  return createActionFunction(args, {
    onPost: async ({ request }) => {
      const data = Object.fromEntries(await request.formData());

      const user = await authenticator.isAuthenticated(request);

      const updatedUser = await prisma.user.update({
        data: { spending_target: data.target.valueOf() },
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
