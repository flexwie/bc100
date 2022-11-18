import { FunctionComponent } from "react";

interface Props {
  className?: string;
}

export const Card: FunctionComponent<{ children: React.ReactNode } & Props> = ({
  children,
  className,
}) => {
  return (
    <div
      className={`border-b-2 p-4 dark:border-ciblack-300 last:border-0 hover:bg-ciwhite-500 dark:hover:bg-ciblack-300 hover:cursor-pointer transition ${className}`}
    >
      {children}
    </div>
  );
};
