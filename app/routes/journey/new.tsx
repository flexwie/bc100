import {
  ActionFunction,
  json,
  LinksFunction,
  redirect,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { CreateForm } from "~/components/CreateForm/CreateForm";
import { authenticator } from "~/services/auth.server";
import {
  uploadFile,
  addJourney,
  deleteJourney,
} from "~/services/journey.server";
import { createActionFunction } from "~/utils/action.server";

import dpStyle from "react-datepicker/dist/react-datepicker.css";

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: dpStyle,
  },
];

export default function New() {
  return (
    <div>
      <h2>Add new journey</h2>
      <CreateForm />
    </div>
  );
}

export const action: ActionFunction = async (args) => {
  return await createActionFunction(args, {
    onPost: async ({ request }) => {
      const user = await authenticator.isAuthenticated(request);

      const body = await unstable_parseMultipartFormData(request, uploadFile);
      await addJourney(body, user!.id);

      return redirect("/journey");
    },
  });
};
