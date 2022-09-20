import { LinksFunction } from "@remix-run/node";
import styles from "./IconButton.css";

export const links: LinksFunction = () => [
  {
    rel: "preload",
    href: "/icons/settings.svg",
    as: "image",
    type: "image/svg+xml",
  },
  {
    rel: "stylesheet",
    href: styles,
  },
];

export const SettingsButton = () => {
  return (
    <span
      data-settings
      className="h-6 border-2 border-ciblue-500 hover:border-ciblue-700 p-4 rounded"
    ></span>
  );
};
