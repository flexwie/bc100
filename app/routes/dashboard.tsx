import { Journey, User } from "@prisma/client";
import {
  ActionFunction,
  LinksFunction,
  LoaderFunction,
  redirect,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Button } from "~/components/Button/Button";
import { Card, links as cardLinks } from "~/components/Card/Card";
import {
  SettingsButton,
  links as sbLinks,
} from "~/components/IconButton/SettingsButton";
import { authenticator } from "~/services/auth.server";
import { addJourney, uploadFile } from "~/services/journey.server";
import { prisma } from "~/services/prisma.server";
import styles from "./dashboard.css";

type LoaderData = { user: User; journeys: Journey[] };

export const links: LinksFunction = () => [
  ...cardLinks(),
  ...sbLinks(),
  { rel: "stylesheet", href: styles },
];

export default function Dashboard() {
  const data = useLoaderData<LoaderData>();

  const [showForm, setShowForm] = useState(false);

  useHotkeys("esc", () => setShowForm(false));

  return (
    <main>
      <div className="flex justify-between items-center">
        <h1>
          <span className="text-gradient">BC100</span> Journeys
        </h1>
        <SettingsButton />
      </div>
      <p className="instructions">
        Journeys are locked at the end of each month. Make sure to edit them
        until then.
      </p>
      <h2 className="font-semibold text-lg mb-2 uppercase">This Month</h2>
      <ul role="list" className="grid grid-cols-2 gap-2">
        {data.journeys.map((j) => (
          <Card journey={j as any} key={j.id} />
        ))}
        {!showForm && (
          <Button
            text="+"
            variant="solid"
            click={() => setShowForm(true)}
            className="transition duration-150"
          />
        )}
      </ul>
      <Form
        className={`grid grid-cols-2 gap-4 mt-4 transition ease-in duration-100 delay-50 ${
          showForm ? "visible opacity-100" : "invisible opacity-0"
        }`}
        method="post"
        action="/dashboard"
        encType="multipart/form-data"
      >
        <label className="grid grid-cols-2">
          Description
          <input name="description" placeholder="Description" />
        </label>
        <label className="grid grid-cols-2">
          Cost
          <input name="cost" placeholder="Cost" />
        </label>

        <label className="grid grid-cols-2">
          Start
          <input name="start_date" placeholder="Start" />
        </label>
        <label className="grid grid-cols-2">
          End
          <input name="end_date" placeholder="End" />
        </label>

        <label className="block">
          <input
            type="file"
            name="attachment"
            className="block w-full text-sm text-slate-500 file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:text-white file:bg-ciblue-500 hover:file:bg-ciblue-700"
          />
        </label>
        <Button text="Send" className="w-1/2" />
      </Form>
    </main>
  );
}

export const loader: LoaderFunction = async ({ request }) => {
  let user = await authenticator.isAuthenticated(request);

  if (user) {
    const journeys = await prisma.journey.findMany({
      where: {
        userId: user.id,
        // end_date: {
        //   lte: "",
        //   gte: "",
        // },
      },
    });

    return { user, journeys };
  }

  return user;
};

export const action: ActionFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    return redirect("/");
  }

  const body = await unstable_parseMultipartFormData(request, uploadFile);
  await addJourney(body, user.id);

  return null;
};
