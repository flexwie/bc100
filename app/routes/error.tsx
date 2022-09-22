import { json, LoaderFunction } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";
import { getSession } from "~/services/session.server";

export default function Error() {
  return <p>Error</p>;
}

export const loader: LoaderFunction = async ({ request }) => {
  let session = await getSession(request.headers.get("cookie"));
  let error = session.get(authenticator.sessionErrorKey);
  console.log(error);
  return json({ error });
};
