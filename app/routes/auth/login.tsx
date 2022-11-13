import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";
import { getSession } from "~/services/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/dashboard",
  });

  let session = await getSession(request.headers.get("cookie"));
  let error = session.get(authenticator.sessionErrorKey);
  console.log(error);
  return json({ error });
};

export const action: ActionFunction = ({ request }) => {
  const url = new URL(request.url);
  const invite_id = url.searchParams.get("invite");
  if (invite_id) {
    return authenticator.authenticate("microsoft", request, {
      successRedirect: `/onboarding/invite?id=${invite_id}`,
    });
  }

  return authenticator.authenticate("microsoft", request);
};
