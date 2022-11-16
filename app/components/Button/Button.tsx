import { LinksFunction } from "@remix-run/node";
import { FunctionComponent } from "react";
import styles from "./Button.css";

export interface ButtonProps {
  click?: () => void;

  text: string;
  variant: "outlined" | "solid";
  className?: string;
}

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: styles,
  },
];

export const Button: FunctionComponent<ButtonProps> = ({
  text,
  variant,
  className,
  click,
}) => {
  const theme =
    variant == "outlined"
      ? "bg-ciwhite-300 text-black hover:text-white hover:bg-ciblue-700"
      : "bg-ciblue-500 text-white hover:bg-ciblue-700";

  return (
    <button
      className={`${className} ${theme} transition-color ease-in-out duration-300 rounded-ml px-3 py-2`}
      onClick={click}
    >
      {text}
    </button>
  );
};
