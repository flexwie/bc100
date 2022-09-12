import { User } from "@prisma/client";
import { Button, links as buttonLinks } from "../components/Button/Button";
import { LinksFunction, LoaderFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import styles from "./index.css";

type LoaderData = User | null;

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: styles,
  },
  ...buttonLinks(),
];

export default function Index() {
  const data = useLoaderData<LoaderData>();

  return (
    <main>
      <h1>
        <span className="text-gradient">BC100</span> Portal
      </h1>
      {data ? (
        <div>
          <p className="instructions">
            Hi {data.name}!{" "}
            <Form action="/dashboard" method="get">
              <Button text="Dashboard" variant="outlined" className="mt-2" />
            </Form>
          </p>
        </div>
      ) : (
        <form action="/auth/login" method="post">
          <button>Login</button>
        </form>
      )}
    </main>
  );
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);
  return user;
};
