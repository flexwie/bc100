import { User } from "@prisma/client";
import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { prisma } from "~/services/prisma.server";

export default function MemberView() {
  const data = useLoaderData<User>();

  return (
    <div>
      <h3>{data.name}</h3>
      <table className="table-auto">
        <thead>
          <tr>
            <th>Origin</th>
          </tr>
        </thead>
      </table>
    </div>
  );
}

export const loader: LoaderFunction = async ({ request, params }) => {
  let user = await authenticator.isAuthenticated(request);
  if (!user) return json({ error: "not authenticated" });

  const id = params.id;
  const result = await prisma.user.findFirstOrThrow({
    where: { id: parseInt(id!) },
  });

  return result;
};
