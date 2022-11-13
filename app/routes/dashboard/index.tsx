import { Journey, User } from "@prisma/client";
import { prisma } from "../../services/prisma.server";
import { Button, links as buttonLinks } from "../../components/Button/Button";
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
  Link,
  Outlet,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { endOfMonth, startOfMonth } from "date-fns";
import {
  uploadFile,
  addJourney,
  deleteJourney,
} from "~/services/journey.server";
import { createActionFunction } from "~/utils/action.server";
import { useState, useRef, useMemo, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import styles from "./index.css";
import dpStyle from "react-datepicker/dist/react-datepicker.css";
import cStyle from "react-circular-progressbar/dist/styles.css";

type LoaderData = {
  user: User;
  journeys?: Journey[];
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
      <p>{error.message}</p>
    </>
  );
};

export default function Index() {
  const data = useLoaderData<LoaderData>();
  const transition = useTransition();
  const action = useActionData();

  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<null | number>(null);

  const formRef = useRef<HTMLFormElement>(null);

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

  useHotkeys("esc", () => {
    setShowForm(false);
    formRef.current?.reset();
  });
  useEffect(() => {
    if (transition.state === "submitting") {
      formRef.current?.reset();
    }
  }, [transition]);

  return (
    <>
      <div className="instructions flex justify-center items-center">
        <div className="block h-20 w-20 mr-4">
          <CircularProgressbar
            text={`${spentPerc}%`}
            value={spentAmount}
            maxValue={parseInt(data.user.spending_target)}
            strokeWidth={15}
            styles={buildStyles({
              pathColor: "#4F39FA",
              trailColor: "#9689FC",
              textColor: "#4F39FA",
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
        <h2>This month</h2>
        <Link to="/journey/new">New</Link>
        <ul>
          {data.journeys?.map((j) => (
            <p>{j.description}</p>
          ))}
        </ul>
      </div>
      <Outlet />
    </>
  );
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);
  if (!user) return redirect("/");

  if (user) {
    const journeys = await prisma.journey.findMany({
      where: {
        user_id: user.id,
        start_date: {
          lte: endOfMonth(new Date()),
          gte: startOfMonth(new Date()),
        },
      },
      include: {
        attachments: true,
      },
    });

    return { user, journeys };
  }

  return user;
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
