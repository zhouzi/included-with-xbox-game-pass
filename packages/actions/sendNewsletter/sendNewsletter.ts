import path from "path";
import fse from "fs-extra";
import {
  EmailCampaignsApi,
  EmailCampaignsApiApiKeys,
} from "sib-api-v3-typescript";
import { format } from "date-fns";
import handlebars from "handlebars";
import mjml from "mjml";

import games from "../../xgp.community/api/v1/games.json";
import news from "../../xgp.community/api/v1/news.json";
import { APIGame } from "../../types";

const LAST_AGGREGATED_AT_PATH = path.join(__dirname, ".lastAggregatedAt");

(async () => {
  const lastAggregatedAt = new Date(
    await fse.readFile(LAST_AGGREGATED_AT_PATH, "utf8")
  );
  const aggregatedAt = new Date();

  const templateParams = await getTemplateParams({
    since: lastAggregatedAt,
    now: aggregatedAt,
  });
  if (isEmptyTemplateParams(templateParams)) {
    // Only send email if there are actual news to share
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

interface MicrosoftAnnouncementItem {
  url: string;
  title: string;
}

interface TemplateParams {
  recentGames: APIGame[];
  releasedSoonGames: APIGame[];
  microsoftAnnouncements: MicrosoftAnnouncementItem[];
}

async function getTemplateParams({
  since,
  now,
}: {
  since: Date;
  now: Date;
}): Promise<TemplateParams> {
  const recentGames = games.filter(
    (game) => new Date(game.addedAt).getTime() > new Date(since).getTime()
  );

  const inTwoWeeks = new Date();
  inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);

  const releasedSoonGames = games.filter((game) => {
    const addedAt = new Date(game.addedAt);
    return (
      addedAt.getTime() > now.getTime() &&
      addedAt.getTime() < inTwoWeeks.getTime()
    );
  });

  return {
    recentGames: recentGames.map(formatGame),
    releasedSoonGames: releasedSoonGames.map(formatGame),
    microsoftAnnouncements: news.filter(
      (newsItem) => new Date(newsItem.publishedAt).getTime() >= since.getTime()
    ),
  };
}

function isEmptyTemplateParams(templateParams: TemplateParams): boolean {
  return (Object.keys(templateParams) as Array<
    keyof typeof templateParams
  >).some((key) => templateParams[key].length > 0);
}

function formatGame(game: APIGame): APIGame {
  const availability = [
    game.availability.pc && "PC",
    game.availability.console && "Console",
  ]
    .filter(Boolean)
    .join(", ");

  return {
    ...game,
    name: `${game.name} (${availability})`,
  };
}

async function generateHTML(params: TemplateParams): Promise<string> {
  const template = await fse.readFile(
    path.join(__dirname, "template.mjml"),
    "utf8"
  );
  const render = handlebars.compile(template);
  const { html, errors } = mjml(render(params), {
    minify: true,
  });

  if (errors.length > 0) {
    console.error(errors);
    throw new Error("Failed to generate HTML from mjml template");
  }

  return html;
}
