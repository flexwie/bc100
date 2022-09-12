import { LinksFunction, LoaderFunction, redirect } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";
import styles from "./settings.css";

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: styles,
  },
];

export default function Settings() {
  return (
    <main>
      <h1>
        <span className="text-gradient">BC100</span> Settings
      </h1>
    </main>
  );
}

export const loader: LoaderFunction = ({ request }) => {
  const user = authenticator.isAuthenticated(request);
  if (!user) return redirect("/");

  return user;
};
