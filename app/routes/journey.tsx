import { Journey, Attachment } from "@prisma/client";
import {
  ErrorBoundaryComponent,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { Outlet, useLoaderData, Link, useLocation } from "@remix-run/react";
import { useMemo } from "react";
import { Button } from "~/components/Button/Button";
import { Card } from "~/components/Simple/Card";
import { authenticator } from "~/services/auth.server";
import { prisma } from "~/services/prisma.server";

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  return (
    <div className="red">
      {error.message}: {error.stack}
    </div>
  );
};

export default function Journeys() {
  const data = useLoaderData<(Journey & { attachments: Attachment[] })[]>();
  const location = useLocation();

  const isJourneyView = useMemo(
    () => /\/journey\/(new|\d+)[\/\S]*/gm.test(location.pathname),
    [location]
  );

  return (
    <>
      <div className="md:grid md:grid-cols-2 md:gap-4 md:h-full">
        <div className={`${isJourneyView && "hidden md:block"}`}>
          <span>This Month</span>
          <div className="mt-4">
            <ul className="grid grid-cols-1 rounded overflow-hidden shadow-lg w-full bg-ciwhite-100 dark:bg-ciblack-700 mb-8">
              {data.map((j) => (
                <Link to={`/journey/${j.id}`}>
                  <Card>
                    <div className="flex items-center justify-between">
                      <span>{j.description}</span>
                      <div>
                        {j.start_date && (
                          <span>
                            {new Date(j.start_date).toLocaleDateString()}
                          </span>
                        )}
                        {j.end_date && (
                          <span>
                            {" "}
                            - {new Date(j.end_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </ul>
            <div
              className={`absolute bottom-0 sm:relative sm:bottom-auto ${
                isJourneyView && "hidden md:block"
              }`}
            >
              <Link to="/journey/new">
                <Button text="Add" variant="solid" />
              </Link>
            </div>
          </div>
        </div>
        <div className="md:border md:rounded md:p-4">
          <Outlet />
        </div>
      </div>
    </>
  );
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);
  if (!user) return redirect("/");

  return await prisma.journey.findMany({
    where: { user_id: user.id },
    include: { attachments: true },
  });
};
