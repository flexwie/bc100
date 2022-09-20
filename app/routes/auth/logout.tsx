import { LoaderFunction, redirect } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const user = await authenticator.isAuthenticated(request);

    if (user) authenticator.logout(request, { redirectTo: "/" });
    return redirect("/");
  } catch (error) {
    console.log(error);
    return redirect("/");
  }
};
