import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";
import {
  commitSession,
  getSession,
  settingsStorage,
} from "~/services/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  await authenticator.authenticate("microsoft", request, {
    successRedirect: "/dashboard",
  });

  return null;
};

export const action: ActionFunction = ({ request }) => {
  const url = new URL(request.url);
  const invite_id = url.searchParams.get("invite");
  if (invite_id) {
    return authenticator.authenticate("microsoft", request, {
      successRedirect: `/onboarding/invite`,
    });
  }

  return authenticator.authenticate("microsoft", request);
};
