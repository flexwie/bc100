import { FunctionComponent } from "react";

interface PillProps {
  text: string;
}

export const Pill: FunctionComponent<PillProps> = ({ text }) => {
  return (
    <span className="bg-gray-200 uppercase px-1 rounded font-bold font-xs text-sm text-gray-600 mr-1">
      {text}
    </span>
  );
};
