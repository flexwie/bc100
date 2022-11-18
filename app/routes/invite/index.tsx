import { LoaderFunction, redirect } from "@remix-run/node";
import { settingsStorage } from "~/services/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const invite_id = url.searchParams.get("invite");

  const settings = await settingsStorage.getSession(
    request.headers.get("cookie")
  );

  if (invite_id) {
    settings.set("from_invite", invite_id);
  }

  const headers = {
    "set-Cookie": await settingsStorage.commitSession(settings),
  };

  return redirect("/auth/login", { headers });
};
