import { Handler } from "@netlify/functions";
import * as https from "https";
import fetch from "node-fetch";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const handler: Handler = async (event, context) => {
  const path = event.path.replace(/\.netlify\/functions\/[^/]+/, "");
  const segments = path.split("/").filter((e) => e);

  switch (event.httpMethod) {
    case "POST":
      const response = await fetch("https://webhook.site/e51daed1-a204-463e-93f6-ca0310bbe48e", {
        method: "POST",
        body: event.body,
        agent: httpsAgent,
      });

      return {
        statusCode: response.status,
        body: JSON.stringify(response.body),
      };
    // Fallthrough case
    default:
      return {
        statusCode: 500,
        body: "unrecognized HTTP Method, must be one of GET/POST/PUT/DELETE",
      };
  }
};

export { handler };
