import { Journey } from "@prisma/client";
import { LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { prisma } from "~/services/prisma.server";
import { createLoaderFunction } from "~/utils/loader.server";

export default function Journeys() {
  const data = useLoaderData<Journey[]>();

  return (
    <ul>
      {data.map((j) => (
        <li>{j.description}</li>
      ))}
    </ul>
  );
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);
  if (!user) return redirect("/");

  return await prisma.journey.findMany({ where: { id: user.id } });
};
