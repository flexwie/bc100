import { LoaderFunction, redirect } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

type LoaderFunctionCreatorArgs = {
  request: Request;
  onLoad: LoaderFunction;
};

export const createLoaderFunction = async (
  args: LoaderFunctionCreatorArgs
): Promise<LoaderFunction> => {
  if (!(await authenticator.isAuthenticated(args.request))) redirect("/");

  return args.onLoad;
};
