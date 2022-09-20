import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";
import { getSession } from "~/services/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/dashbaord",
  });

  let session = await getSession(request.headers.get("cookie"));
  let error = session.get(authenticator.sessionErrorKey);
  return json({ error });
};

export const action: ActionFunction = ({ request }) => {
  return authenticator.authenticate("microsoft", request);
};
