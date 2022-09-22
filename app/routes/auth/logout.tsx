import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

export const action: ActionFunction = async ({ request }) => {
  return authenticator.logout(request, {
    redirectTo: "/",
  });
};
