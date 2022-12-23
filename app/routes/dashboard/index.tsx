import { Journey, User } from "@prisma/client";
import { prisma } from "../../services/prisma.server";
import {
  ActionFunction,
  ErrorBoundaryComponent,
  json,
  LinksFunction,
  LoaderFunction,
  redirect,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import {
  Outlet,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import {
  uploadFile,
  addJourney,
  deleteJourney,
} from "~/services/journey.server";
import { createActionFunction } from "~/utils/action.server";
import _ from "lodash";
import { useMemo } from "react";

import styles from "./index.css";
import dpStyle from "react-datepicker/dist/react-datepicker.css";
import cStyle from "react-circular-progressbar/dist/styles.css";
import { JourneySum } from "~/components/JourneyGraphs/JourneySum";

type LoaderData = {
  user: User;
  journeys: Journey[];
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "stylesheet", href: dpStyle },
  { rel: "stylesheet", href: cStyle },
];

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  console.log(error);
  return (
    <>
      <p>{error.stack}</p>
    </>
  );
};

export default function Index() {
  const data = useLoaderData<LoaderData>();
  const transition = useTransition();
  const action = useActionData();

  const spentAmount = useMemo(
    () =>
      data.journeys
        ? data.journeys.reduce((a, o) => {
            return a + parseInt(o.cost);
          }, 0)
        : 0,
    [data]
  );
  const spentPerc = useMemo(
    () =>
      ((100 * spentAmount) / parseInt(data.user.spending_target)).toFixed(0),
    [data, spentAmount]
  );
  const summarizedDates = useMemo(
    () =>
      _(data.journeys)
        .groupBy(
          ({ start_date }) =>
            `${new Date(start_date).getMonth()}-${new Date(
              start_date
            ).getFullYear()}`
        )
        .map((j, month) => ({
          month: month,
          sum: j.length,
        }))
        .value(),
    [data]
  );

  return (
    <>
      <div className="leading-relaxed bg-ciblue-500 my-4 rounded-md p-4 flex justify-center items-center">
        <div className="block h-20 w-20 mr-4">
          <CircularProgressbar
            text={`${spentPerc}%`}
            value={spentAmount}
            maxValue={parseInt(data.user.spending_target)}
            strokeWidth={15}
            styles={buildStyles({
              pathColor: "#9689FC",
              trailColor: "#4f39fa",
              textColor: "#9689FC",
              rotation: 0.1,
            })}
          />
        </div>
        <div>
          You reached <p className="inline font-bold">{spentAmount}€</p> of your{" "}
          <p className="inline font-bold">{data.user.spending_target}€</p>{" "}
          target!
        </div>
      </div>
      <div>
        <JourneySum journeySummary={summarizedDates} />
      </div>
      <Outlet />
    </>
  );
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);
  if (!user) return redirect("/");

  const journeys = await prisma.journey.findMany();

  return json({ user, journeys });
};

export const action: ActionFunction = async (args) => {
  return await createActionFunction(args, {
    onPost: async ({ request }) => {
      const user = await authenticator.isAuthenticated(request);

      try {
        const body = await unstable_parseMultipartFormData(request, uploadFile);
        await addJourney(body, user!.id);
      } catch (e) {
        return json({
          error: (e as Error).message + "\n" + (e as Error).stack,
        });
      }
      return json({ error: null });
    },
    onDelete: async ({ request }) => {
      const user = await authenticator.isAuthenticated(request);
      const url = new URL(request.url);
      const id = url.searchParams.get("id");

      try {
        await deleteJourney(parseInt(id!), user!.id);
        return json({ error: null });
      } catch (e) {
        return json({
          error: (e as Error).message + "\n" + (e as Error).stack,
        });
      }
    },
  });
};
