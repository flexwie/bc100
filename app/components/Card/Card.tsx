import { Attachment, Journey } from "@prisma/client";
import { LinksFunction } from "@remix-run/node";
import { FunctionComponent } from "react";
import styles from "./Card.css";
import { Pill } from "../Pill/Pill";
import { DateTime } from "luxon";
import { Form, Link } from "@remix-run/react";
import { Button } from "../Button/Button";

interface CardProps {
  journey: Journey & { attachments: Attachment[] };
  className?: string;
  selected?: boolean;
  onClick?: () => void;
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
  {
    rel: "preload",
    href: "/icons/clip.svg",
    as: "image",
    type: "image/svg+xml",
  },
];

export const Card: FunctionComponent<CardProps> = ({
  journey,
  className,
  selected,
  onClick,
}) => {
  return (
    <li
      className={`flex p-0.5 cursor-pointer list-none transition ease-in duration-100 hover:bg-[position:0] ${
        journey.private && "locked cursor-default"
      } ${!selected && "link-card"} ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick && onClick();
      }}
    >
      <div
        className={`w-full px-5 py-4 leading-snug rounded-md opacity-80 bg-white dark:bg-ciwhite-500 grid grid-cols-2 gap-2`}
      >
        <h2 className={`col-span-2`}>
          <div>
            <>
              {journey.description} @{" "}
              {parseFloat(journey.cost as any).toFixed(2)}€
            </>
          </div>
          {journey.private && <span data-locked />}
          {journey.attachments.length > 0 && <span data-hasattachments />}
        </h2>
        <p>
          <Pill text="depature" />
          {DateTime.fromISO(journey.start_date as any)
            .setLocale("de")
            .toLocaleString({
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
        </p>
        <p className={`${!journey.end_date && "invisible"}`}>
          <Pill text="return" />
          {DateTime.fromISO(journey.end_date as any)
            .setLocale("de")
            .toLocaleString({
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
        </p>
        <div
          className={`col-span-2 ${
            (!selected || journey.attachments.length == 0) && "hidden invisible"
          }`}
        >
          <p className="font-semibold">Attachments</p>
          {journey.attachments.map((a) => (
            <p key={a.id} className="p-0 m-0 w-fit">
              <a
                href={a.sas_url!}
                target="_blank"
                className="group transition duration-150 w-fit text-ciblue-500"
              >
                {a.filename}
                <span className="block max-w-0 group-hover:max-w-full transition-all duration-150 h-0.5 bg-ciblue-300"></span>
              </a>
            </p>
          ))}
        </div>
        <Form
          className={`${!selected && "hidden invisible"} mt-4 w-full`}
          method="delete"
          action={`/dashboard?id=${journey.id}`}
        >
          <Button variant="solid" text="Delete" className="w-full" />
        </Form>
      </div>
    </li>
  );
};
