import { json, LoaderFunction } from "@remix-run/node";
import { Link } from "react-router-dom";
import { authenticator } from "~/services/auth.server";
import { settingsStorage } from "~/services/session.server";

export default function Login() {
  return (
    <div>
      <h2 className="mb-4">Login</h2>
      <div className="flex flex-col">
        <Link to="/auth/authenticate?method=github">GitHub</Link>

        <Link to="/auth/authenticate?method=microsoft">Microsoft</Link>
      </div>
    </div>
  );
}

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

  return json({}, { headers });
};
