import path from "path";
import fse from "fs-extra";
import {
  EmailCampaignsApi,
  EmailCampaignsApiApiKeys,
} from "sib-api-v3-typescript";
import { format } from "date-fns";

import games from "../../xgp.community/api/v1/games.json";
import posts from "../../xgp.community/api/v1/posts.json";
import {
  getTemplateParams,
  isEmptyTemplateParams,
  generateHTML,
} from "./generateHTML";

const LAST_AGGREGATED_AT_PATH = path.join(__dirname, ".lastAggregatedAt");

(async () => {
  const lastAggregatedAt = new Date(
    await fse.readFile(LAST_AGGREGATED_AT_PATH, "utf8")
  );
  const aggregatedAt = new Date();

  const templateParams = await getTemplateParams({
    games: games.filter(
      (game) =>
        new Date(game.addedAt).getTime() > new Date(lastAggregatedAt).getTime()
    ),
    posts: posts.filter(
      (post) =>
        new Date(post.publishedAt).getTime() >= lastAggregatedAt.getTime()
    ),
  });
  if (!isEmptyTemplateParams(templateParams)) {
    // Only send email if there are actual posts to share
    const html = await generateHTML(templateParams);

    // Send the next day at 11am
    const sendAt = new Date(aggregatedAt.getTime());
    sendAt.setDate(sendAt.getDate() + 1);
    sendAt.setHours(11, 0, 0, 0);

    const subject = `Xbox Game Pass Weekly Digest, ${format(
      aggregatedAt,
      "MMMM dd"
    )}`;

    await sendEmail({ subject, html, sendAt });
  }

  await fse.writeFile(LAST_AGGREGATED_AT_PATH, aggregatedAt.toISOString());
})();

async function sendEmail({
  subject,
  html,
  sendAt,
}: {
  subject: string;
  html: string;
  sendAt: Date;
}) {
  const api = new EmailCampaignsApi();
  api.setApiKey(
    EmailCampaignsApiApiKeys.apiKey,
    process.env.SENDINBLUE_API_KEY!
  );

  await api.createEmailCampaign({
    name: subject,
    subject,
    sender: {
      name: "Gabin",
      email: "gabin@xgp.community",
    },
    recipients: {
      listIds: [Number(process.env.SENDINBLUE_LIST_ID!)],
    },
    htmlContent: html,
    scheduledAt: sendAt,
  });
}
