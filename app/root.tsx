import {
  ErrorBoundaryComponent,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
  redirect,
} from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import styles from "./tailwind.css";
import rootStyles from "./root.css";

import { authenticator } from "./services/auth.server";
import { Organisation, User } from "@prisma/client";
import { useMemo } from "react";

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: styles,
  },
  {
    rel: "stylesheet",
    href: rootStyles,
  },
];

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  console.log(error);
  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <p>Oh no! There was an error :(</p>
        <p>{error.message}</p>
        <Scripts />
      </body>
    </html>
  );
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "BC100 Portal",
  viewport: "width=device-width,initial-scale=1",
});

function App() {
  const { pathname } = useLocation();
  const data = useLoaderData<User & { organisation?: Organisation }>();

  const isOrgaAdmin = useMemo(
    () => data?.organisation?.admin_id == data?.id,
    [data]
  );

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="bg-ciwhite-300 dark:bg-ciblack-500 dark:text-ciwhite-300">
        <main>
          <div className="flex sm:justify-between justify-center items-center">
            <h1>
              <span className="text-gradient">BC100</span> Portal
            </h1>
          </div>
          {pathname != "/onboarding" && pathname != "/onboarding/invite" && (
            <div className="grid grid-cols-5 mb-6">
              <a href="/dashboard">
                <div className={createBorder(pathname, "/dashboard")}>
                  Overview
                </div>
              </a>
              <a href="/journey">
                <div className={createBorder(pathname, "/journey")}>
                  Journeys
                </div>
              </a>

              {isOrgaAdmin && (
                <a href="/organisation">
                  <div className={createBorder(pathname, "/organisation")}>
                    Organisation
                  </div>
                </a>
              )}
              <div
                className={`${
                  isOrgaAdmin ? "col-span-1" : "col-span-2"
                } border-b-4 border-ciblue-500`}
              />
              <a href="/settings">
                <div className={createBorder(pathname, "/settings")}>
                  Settings
                </div>
              </a>
            </div>
          )}
          <Outlet />
        </main>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);

  if (
    user &&
    user.is_onboarded == false &&
    !(
      request.url.endsWith("onboarding") ||
      request.url.endsWith("onboarding/invite")
    )
  ) {
    return redirect("/onboarding");
  }

  return null;
};

const createBorder = (path: string, tab: string): string => {
  let className = "text-center border-ciblue-500 ";

  if (path.startsWith(tab)) {
    className +=
      "border-l-4 border-r-4 border-t-4 border-b-4 border-b-ciwhite-300 dark:border-b-ciblack-500 rounded-tl-md rounded-tr-md";
  } else {
    className +=
      "border-b-4 border-t-4 border-t-ciwhite-300 dark:border-t-ciblack-500";
  }

  return className;
};

export default App;
