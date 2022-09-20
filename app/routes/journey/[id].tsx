import { ActionFunction } from "@remix-run/node";
import { createActionFunction } from "~/utils/action.server";

export const action: ActionFunction = (args) => {
  return createActionFunction(args, {
    onDelete: async () => {},
  });
};
