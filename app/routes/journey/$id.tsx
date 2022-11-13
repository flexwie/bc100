import { Journey } from "@prisma/client";
import { ErrorBoundaryComponent, json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { prisma } from "~/services/prisma.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  let user = await authenticator.isAuthenticated(request);
  if (!user) return json({ error: "not authenticated" });

  const id = params.id;
  const result = await prisma.journey.findFirstOrThrow({
    where: { id: parseInt(id!) },
  });

  return result;
};

export default function JourneyId() {
  const params = useParams();
  const data = useLoaderData<Journey>();
  const id = params.id;
  return (
    <div>
      <p>Id: {id}</p>
      <p>Name: {data.description}</p>
    </div>
  );
}
