import path from "path";
import fse from "fs-extra";
import {
  EmailCampaignsApi,
  EmailCampaignsApiApiKeys,
} from "sib-api-v3-typescript";
import { format } from "date-fns";
import games from "../../xgp.community/api/v1/games.json";
import { APIGame } from "../../types";
import { GameItem } from "./types";
import { getMicrosoftAnnouncements } from "./getMicrosoftAnnouncements";
import { generateHTML } from "./generateHTML";

(async () => {
  const lastAggregatedAtPath = path.join(__dirname, ".lastAggregatedAt");
  const lastAggregatedAt = new Date(
    await fse.readFile(lastAggregatedAtPath, "utf8")
  );

  const aggregatedAt = new Date();

  const recentGames = games.filter(
    (game) =>
      new Date(game.addedAt).getTime() > new Date(lastAggregatedAt).getTime()
  );

  const inTwoWeeks = new Date();
  inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);

  const releasedSoonGames = games.filter((game) => {
    const addedAt = new Date(game.addedAt);
    return (
      addedAt.getTime() > aggregatedAt.getTime() &&
      addedAt.getTime() < inTwoWeeks.getTime()
    );
  });

  const microsoftAnnouncements = await getMicrosoftAnnouncements(
    lastAggregatedAt
  );

  const params = {
    recentGames: recentGames.map(formatGameToParams),
    releasedSoonGames: releasedSoonGames.map(formatGameToParams),
    microsoftAnnouncements,
  };
  if (
    (Object.keys(params) as Array<keyof typeof params>).some(
      (key) => params[key].length > 0
    )
  ) {
    // Only send email if there are actual news to share
    const htmlContent = await generateHTML(params);

    // Send the next day at 11am
    const scheduledAt = new Date(aggregatedAt.getTime());
    scheduledAt.setDate(scheduledAt.getDate() + 1);
    scheduledAt.setHours(11, 0, 0, 0);

    const subject = `Xbox Game Pass Weekly Digest, ${format(
      aggregatedAt,
      "MMMM dd"
    )}`;

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
      htmlContent,
      scheduledAt,
    });
  }

  await fse.writeFile(lastAggregatedAtPath, aggregatedAt.toISOString());
})();

function formatGameToParams(game: APIGame): GameItem {
  return {
    url: game.url,
    name: game.name,
    availability: [
      game.availability.pc && "PC",
      game.availability.console && "Console",
    ]
      .filter(Boolean)
      .join(", "),
  };
}
