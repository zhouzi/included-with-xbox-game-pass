import { NextApiRequest, NextApiResponse } from "next";
import {
  EmailCampaignsApi,
  EmailCampaignsApiApiKeys,
} from "sib-api-v3-typescript";
import games from "../../../public/api/games.json";
import { createNewsletterTemplate } from "../../../createNewsletterTemplate";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  let newGames = games;

  if (process.env.SENDINBLUE_API_KEY) {
    const sendinblue = new EmailCampaignsApi();
    sendinblue.setApiKey(
      EmailCampaignsApiApiKeys.apiKey,
      process.env.SENDINBLUE_API_KEY
    );
    const {
      body: { campaigns },
    } = await sendinblue.getEmailCampaigns(
      "classic",
      "sent",
      undefined,
      undefined,
      1
    );
    const lastCampaign = campaigns[0];

    if (lastCampaign) {
      newGames = games.filter(
        (game) =>
          new Date(game.addedAt).getTime() >
          new Date(lastCampaign.createdAt).getTime()
      );
    } else {
      console.warn(
        "No campaigns found on Sendinblue. The next campaign will list all games."
      );
    }
  } else {
    console.warn(
      "Missing environment variable: SENDINBLUE_API_KEY. The next campaign will list all games."
    );
  }

  const { html, errors } = createNewsletterTemplate({ newGames });

  if (errors.length > 0) {
    res.status(500).json(errors.map((error) => error.formattedMessage));
    return;
  }

  console.log(
    `The next newsletter will contain ${newGames.length} out of ${games.length}.`
  );
  res.status(200).end(html);
};
