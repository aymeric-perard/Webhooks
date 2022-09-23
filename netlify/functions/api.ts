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
      // const url = "https://webhook.site/e51daed1-a204-463e-93f6-ca0310bbe48e";
      const url =
        "https://richemont.webhook.office.com/webhookb2/4b55a2b1-ee2f-4140-839a-82a18e7626fb@94b3f1b2-8b3a-49e3-ba33-8b8fb6d18361/IncomingWebhook/adb8a26f46ef4466864f8920c6ea5fa4/d44fdee5-d72e-4204-850e-0936e7171fa0";
      const response = await fetch(url, {
        method: "POST",
        body: createTeamsCard(event.body),
        agent: httpsAgent,
      });

      return {
        statusCode: response.status,
        body: response.statusText + " " + (await response.text()), //JSON.stringify(response.body),
      };
    // Fallthrough case
    default:
      return {
        statusCode: 500,
        body: "unrecognized HTTP Method, must be one of GET/POST/PUT/DELETE",
      };
  }
};

const createTeamsCard = function (body): string {
  const card = {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        contentUrl: null,
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.2",
          body: parseBitBucketMessage(body),
        },
      },
    ],
  };
  return JSON.stringify(card);
};

const parseBitBucketMessage = function (body): Array {
  const parsedBody = JSON.parse(body);
  const commit = parsedBody.changesets.values[0].toCommit;
  const changes = parsedBody.changesets.values[0].changes;
  const branch = parsedBody.refChanges[0].refId.replace("refs/heads/", "");
  const commitUrl = "https://agile.richemont.com/bitbucket/projects/SAP1/repos/hr-myspot-pmp-mobile/commits/" + commit.id;

  let blocks = [];
  blocks.push(textBlock(parsedBody.repository.slug + " - " + branch, "large"));
  blocks.push(textBlock("\r"));
  blocks.push(textBlock(commit.author.name + " authored [" + commit.displayId + "](" + commitUrl + ")"));
  blocks.push(textBlock(commit.message, "", "warning"));
  blocks.push(textBlock("\r"));
  blocks.push(textBlock(changes.size + " changes:"));
  changes.values.map((change) => {
    const color = change.type === "ADD" ? "good" : "attention";
    blocks.push(textBlock("- " + change.type + " : " + change.path.toString, "", color));
  });

  return blocks;
};

const textBlock = function (text: string, size = "medium", color = "default"): object {
  return {
    type: "TextBlock",
    text: text,
    size: size,
    color: color,
  };
};

export { handler };
