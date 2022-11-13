import { DataFunctionArgs, LoaderFunction, redirect } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

type LoaderFunctionCreatorArgs = {
  request: Request;
  onLoad: LoaderFunction;
};

export const createLoaderFunction = async (
  args: DataFunctionArgs,
  fn: any
): Promise<() => Promise<LoaderFunction>> => {
  const user = await authenticator.isAuthenticated(args.request);

  return fn(args);
};
