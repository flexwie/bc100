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
import { useMemo, useState } from "react";

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

  const [menu, setMenu] = useState(true);

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
          <div className="sm:flex sm:justify-between grid grid-cols-6 items-center mb-4">
            <div
              className="sm:hidden visible align-middle"
              onClick={() => setMenu(!menu)}
            >
              <p className="font-extrabold cursor-pointer p-4 rounded dark:hover:bg-ciblack-100 w-fit h-fit">
                {menu ? "x" : "="}
              </p>
            </div>
            <h1 className="col-span-4">
              <span className="text-gradient">BC100</span> Portal
            </h1>
            <div />
          </div>
          {!pathname.startsWith("/auth") &&
            !(pathname == "/") &&
            !pathname.startsWith("/onboarding") &&
            menu && (
              <div className="sm:grid grid-cols-5 mb-6 flex flex-col">
                <a href="/dashboard" className="dark:hover:bg-ciblack-100">
                  <div className={createBorder(pathname, "/dashboard")}>
                    Overview
                  </div>
                </a>
                <a href="/journey" className="sm:dark:hover:bg-ciblack-100">
                  <div className={createBorder(pathname, "/journey")}>
                    Journeys
                  </div>
                </a>

                {isOrgaAdmin && (
                  <a href="/organisation" className="dark:hover:bg-ciblack-100">
                    <div className={createBorder(pathname, "/organisation")}>
                      Organisation
                    </div>
                  </a>
                )}
                <div
                  className={`${
                    isOrgaAdmin ? "col-span-1" : "col-span-2"
                  } sm:border-b-4 border-ciblue-500`}
                />
                <a href="/settings" className="dark:hover:bg-ciblack-100">
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
  let className = "text-center border-ciblue-500 border-0 p-4 sm:p-0 ";

  if (path.startsWith(tab)) {
    className +=
      "sm:border-l-4 sm:border-r-4 sm:border-t-4 sm:border-b-4 sm:border-b-ciwhite-300 sm:dark:border-b-ciblack-500 sm:rounded-tl-md sm:rounded-tr-md";
  } else {
    className +=
      "sm:border-b-4 sm:border-t-4 border-t-ciwhite-300 dark:border-t-ciblack-500";
  }

  return className;
};

export default App;
