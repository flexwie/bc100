import { Attachment, Journey, User } from "@prisma/client";
import {
  ActionFunction,
  json,
  LinksFunction,
  LoaderFunction,
  redirect,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { useActionData, useLoaderData, useTransition } from "@remix-run/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Button } from "~/components/Button/Button";
import { Card, links as cardLinks } from "~/components/Card/Card";
import { CreateForm } from "~/components/CreateForm/CreateForm";
import {
  SettingsButton,
  links as sbLinks,
} from "~/components/IconButton/SettingsButton";
import { authenticator } from "~/services/auth.server";
import {
  addJourney,
  deleteJourney,
  uploadFile,
} from "~/services/journey.server";
import { prisma } from "~/services/prisma.server";
import { startOfMonth, endOfMonth } from "date-fns";
import styles from "./dashboard.css";
import dpStyle from "react-datepicker/dist/react-datepicker.css";
import { createActionFunction } from "~/utils/action.server";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import cStyle from "react-circular-progressbar/dist/styles.css";

type LoaderData = {
  user: User;
  journeys: Journey[];
};

export const links: LinksFunction = () => [
  ...cardLinks(),
  ...sbLinks(),
  { rel: "stylesheet", href: styles },
  { rel: "stylesheet", href: dpStyle },
  { rel: "stylesheet", href: cStyle },
];

export default function Dashboard() {
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
    <div onClick={() => selected && setSelected(null)}>
      <main>
        <div className="flex justify-between items-center">
          <h1>
            <span className="text-gradient">BC100</span> Journeys
          </h1>
          <a href="/settings" className="flex">
            <SettingsButton />
          </a>
        </div>
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
            You reached <p className="inline font-bold">{spentAmount}€</p> of
            your{" "}
            <p className="inline font-bold">{data.user.spending_target}€</p>{" "}
            target!
          </div>
        </div>
        <div className="flex justify-between">
          <h2 className="font-semibold text-lg mb-2 uppercase">This Month</h2>
          <Button
            text="+ Add New"
            variant="solid"
            click={() => setShowForm(true)}
            className="transition duration-150 h-fit px-4 py-2"
          />
        </div>
        <div className={`${!showForm && "hidden"}`}>
          <p className="text-red">{action ? action.error : ""}</p>
          <CreateForm
            open={showForm}
            formRef={formRef}
            onSubmit={() => setShowForm(false)}
          />
        </div>
        <ul role="list" className="grid grid-cols-1 gap-2">
          {data.journeys &&
            data.journeys.map((j) => (
              <Card
                journey={j as any}
                key={j.id}
                onClick={() =>
                  selected != j.id && !j.private && setSelected(j.id)
                }
                selected={selected == j.id}
              />
            ))}
        </ul>
      </main>
    </div>
  );
}

export const loader: LoaderFunction = async ({ request }) => {
  let user = await authenticator.isAuthenticated(request);

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
        return json({ error: (e as Error).message });
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
        return json({ error: (e as Error).message });
      }
    },
  });
};
