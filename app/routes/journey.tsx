import {
  ErrorBoundaryComponent,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  return (
    <div className="red">
      {error.message}: {error.stack}
    </div>
  );
};

export default function Journeys() {
  return (
    <>
      <Outlet />
    </>
  );
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);
  if (!user) return redirect("/");

  return null;
};
