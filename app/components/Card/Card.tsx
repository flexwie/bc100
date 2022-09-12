import { Journey } from "@prisma/client";
import { LinksFunction } from "@remix-run/node";
import { FunctionComponent } from "react";
import styles from "./Card.css";
import { Pill } from "../Pill/Pill";
import { DateTime } from "luxon";

interface CardProps {
  journey: Journey;
}

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: styles,
  },
  {
    rel: "preload",
    href: "/icons/lock.svg",
    as: "image",
    type: "image/svg+xml",
  },
];

export const Card: FunctionComponent<CardProps> = ({ journey }) => {
  return (
    <li
      className={`link-card cursor-pointer ${
        journey.private && "locked cursor-default"
      }`}
    >
      <div>
        <h2>
          {journey.description}
          {journey.private && <span data-locked />}
        </h2>
        <p>
          <Pill text="from" />
          {DateTime.fromISO(journey.start_date as any)
            .setLocale("de")
            .toLocaleString({
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
        </p>
        <p>
          <Pill text="to" />
          {DateTime.fromISO(journey.end_date as any)
            .setLocale("de")
            .toLocaleString({
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
        </p>
      </div>
    </li>
  );
};
