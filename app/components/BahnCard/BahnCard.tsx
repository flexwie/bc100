import { LinksFunction } from "@remix-run/node";

import styles from "./BahnCard.css";

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: styles,
  },
];

export const BahnCard = () => {
  return (
    <div className="w-80 grid grid-cols-2 rounded justify-between border-black border-2 p-4">
      <div className="col-span-2 text-right">DB</div>
      <div>
        <div className="flex">
          <div>BahnCard 100</div>
          <div>+City</div>
        </div>
      </div>
      <div>image</div>
    </div>
  );
};
