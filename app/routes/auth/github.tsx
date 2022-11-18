import { Headers, LoaderFunction, redirect } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";
import { prisma } from "~/services/prisma.server";
import {
  commitSession,
  getSession,
  settingsStorage,
} from "~/services/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  // make sure request is authenticated
  let user = await authenticator.authenticate("github", request, {
    failureRedirect: "/",
  });

  // get settings and session from the cookies
  let settings = await settingsStorage.getSession(
    request.headers.get("cookie")
  );
  let session = await getSession(request.headers.get("cookie"));
  console.log("setting data: ", settings.data);

  // update user if callback comes from an invite registration
  if (settings.has("from_invite")) {
    let invite_id = settings.get("from_invite");

    // fetch invite from db and check if the e-mail matches
    let invite = await prisma.invite.findUniqueOrThrow({
      where: { id: parseInt(invite_id) },
    });
    console.log("invite id: ", invite.id);
    if (invite.user_mail.toLowerCase() != user.mail.toLowerCase()) {
      console.log(invite.user_mail, user.mail);
      throw new Error("User mail does not match invite mail");
    }

    // update user with orga id; remove invite
    user = await prisma.user.update({
      where: { id: user.id },
      data: { organisation_id: invite.organisation_id },
    });
    console.log(user);
    await prisma.invite.delete({ where: { id: invite.id } });
    console.log("removed invite");

    // update cookies
    session.set(authenticator.sessionKey, user);
    settings.unset("from_invite");

    // update headers and redirect
    let headers = new Headers({
      "set-Cookie": `${await commitSession(
        session
      )},${await settingsStorage.commitSession(settings)} `,
    });
    return redirect("/onboarding/invite", { headers });
  }

  session.set(authenticator.sessionKey, user);
  let headers = new Headers({ "set-Cookie": await commitSession(session) });

  if (user.is_onboarded) return redirect("/dashboard", { headers });
  return redirect("/onboarding", { headers });
};
