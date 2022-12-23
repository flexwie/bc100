import { Journey } from "@prisma/client";
import { ErrorBoundaryComponent, json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import { Badge } from "~/components/Badge/Badge";
import { Button } from "~/components/Button/Button";
import { authenticator } from "~/services/auth.server";
import { prisma } from "~/services/prisma.server";

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  return <div>Error loading: {error.message}</div>;
};

export default function JourneyId() {
  const params = useParams();
  const data = useLoaderData<Journey>();
  const id = params.id;

  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className="mb-4">
          <span className="text-bold text-2xl">{data.description}</span>
        </div>
        <div className="grid grid-cols-2">
          <div className="flex flex-col">
            <span>{new Date(data.start_date).toLocaleDateString()}</span>
            <Badge className="w-2">Depature</Badge>
          </div>
          {data.end_date && (
            <div className="flex flex-col">
              <span>{new Date(data.end_date).toLocaleDateString()}</span>
              <Badge className="w-2">Return</Badge>
            </div>
          )}
        </div>
      </div>
      <div className="sticky bottom-0">
        <Button text="Delete" />
      </div>
    </div>
  );
}

export const loader: LoaderFunction = async ({ request, params }) => {
  let user = await authenticator.isAuthenticated(request);
  if (!user) return json({ error: "not authenticated" });

  const id = params.id;
  const result = await prisma.journey.findFirstOrThrow({
    where: { id: parseInt(id!) },
  });

  return result;
};
