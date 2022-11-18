import { User } from "@prisma/client";
import { links as buttonLinks } from "../components/Button/Button";
import { LinksFunction, LoaderFunction } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
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
    <>
      <div>
        <p>Login Page</p>
        <Link to="/auth/login">
          <button>Login</button>
        </Link>
      </div>
      <Outlet />
    </>
  );
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);
  return user;
};
