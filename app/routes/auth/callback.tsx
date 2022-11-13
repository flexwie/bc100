import { Headers, LoaderFunction, redirect } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";
import { commitSession, getSession } from "~/services/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  let user = await authenticator.authenticate("microsoft", request, {
    failureRedirect: "/",
  });

  let session = await getSession(request.headers.get("cookie"));
  session.set(authenticator.sessionKey, user);

  let headers = new Headers({ "set-Cookie": await commitSession(session) });

  if (user.is_onboarded) return redirect("/dashboard", { headers });
  return redirect("/onboarding", { headers });
};
