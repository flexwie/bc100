import { FunctionComponent } from "react";

export const Badge: FunctionComponent<{ className: string }> = (props) => {
  return (
    <div className={props.className}>
      <span className="bg-gray-200 uppercase px-1 rounded font-bold font-xs text-sm text-gray-600 mr-1">
        {props.children}
      </span>
    </div>
  );
};
