import { Journey, Organisation, User, UserPicture } from "@prisma/client";
import { LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Button } from "~/components/Button/Button";
import { Card } from "~/components/Simple/Card";
import { authenticator, isAdmin } from "~/services/auth.server";
import { prisma } from "~/services/prisma.server";

export default function Members() {
  const data = useLoaderData<
    Organisation & {
      users: (User & { picture: UserPicture; journeys: Journey[] })[];
    }
  >();

  return (
    <div>
      <h2 className="mb-8">{data.name} - Members</h2>
      <div className="grid grid-cols-1 rounded overflow-hidden shadow-lg w-full bg-ciwhite-300">
        {data.users.map((u) => (
          <Card>
            <div className="flex items-center">
              <img
                className="w-12 mr-4"
                src={`data:image/png;base64, ${u.picture.data}`}
              />
              <div>
                <p>{u.name}</p>
                <p className="text-slate-500 font-sm">{u.mail.toLowerCase()}</p>
                <p>Spent: {spentThisMonth(u.journeys as any[])}€</p>
                <p>
                  Last Journey: {latestJourney(u.journeys as any[]).toString()}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);
  if (!isAdmin(user)) return redirect("/");

  return await prisma.organisation.findFirstOrThrow({
    where: { id: user!.organisation_id! },
    include: { users: { include: { picture: true, journeys: true } } },
  });
};

const spentThisMonth = (journeys: Journey[]) => {
  return journeys.reduce((p, c): any => p + parseInt(c.cost.toFixed(2)), 0);
};

const latestJourney = (journeys: Journey[]) => {
  return new Date(Math.max(...journeys.map(({ start_date }) => start_date)));
};
