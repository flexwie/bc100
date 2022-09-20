import { ActionFunction, DataFunctionArgs, redirect } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

type ActionFunctionCreatorArgs = {
  onPost?: ActionFunction;
  onDelete?: ActionFunction;
};

export const createActionFunction = async (
  args: DataFunctionArgs,
  handler: ActionFunctionCreatorArgs
): Promise<ActionFunction> => {
  if (!(await authenticator.isAuthenticated(args.request))) redirect("/");

  switch (args.request.method) {
    case "POST":
      if (handler.onPost) return handler.onPost(args);
      throw new Error("No handler declared for POST");
    case "DELETE":
      if (handler.onDelete) return handler.onDelete(args);
      throw new Error("No handler declared for DELETE");
    default:
      throw new Error(`No handler declared for ${args.request.method}`);
  }
};
