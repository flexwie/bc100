import { LoaderFunction } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const method = url.searchParams.get("method");

  if (!method) throw new Error("No method specified");

  return await authenticator.authenticate(method, request, {
    successRedirect: "/dashboard",
  });
};
