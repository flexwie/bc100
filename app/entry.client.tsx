import { RemixBrowser, useLocation, useMatches } from "@remix-run/react";
import { hydrateRoot } from "react-dom/client";
import * as Sentry from "@sentry/remix";
import { useEffect } from "react";

Sentry.init({
  dsn: "https://d346f97076e14b3a9fc0f026292e0f99:53409bbea62a4d8f8baa92f5c1df8f67@o4504113167925248.ingest.sentry.io/4504113168842752",
  tracesSampleRate: 1,
  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.remixRouterInstrumentation(
        useEffect,
        useLocation,
        useMatches
      ),
    }),
  ],
});

hydrateRoot(document, <RemixBrowser />);
