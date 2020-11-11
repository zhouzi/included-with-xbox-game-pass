import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import games from "../../../public/api/games.json";
import posts from "../../../public/api/posts.json";
import { createNewsletterTemplate } from "../../../createNewsletterTemplate";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  let newGames = games;
  let newPosts = posts;

  if (process.env.SENDINBLUE_API_KEY) {
    const {
      data: { campaigns },
    } = await axios.get<{ campaigns: Array<{ createdAt: string }> }>(
      "/emailCampaigns",
      {
        params: {
          status: "sent",
          limit: 1,
        },
        baseURL: "https://api.sendinblue.com/v3/",
        headers: {
          "api-key": process.env.SENDINBLUE_API_KEY,
        },
      }
    );
    const lastCampaign = campaigns[0];

    if (lastCampaign) {
      newGames = games.filter(
        (game) =>
          new Date(game.addedAt).getTime() >
          new Date(lastCampaign.createdAt).getTime()
      );
      newPosts = posts.filter(
        (post) =>
          new Date(post.publishedAt).getTime() >
          new Date(lastCampaign.createdAt).getTime()
      );
    } else {
      console.warn(
        "No campaigns found on Sendinblue. The next campaign will list all games and posts."
      );
    }
  } else {
    console.warn(
      "Missing environment variable: SENDINBLUE_API_KEY. The next campaign will list all games and posts."
    );
  }

  const { html, errors } = createNewsletterTemplate({ newGames, newPosts });

  if (errors.length > 0) {
    res.status(500).json(errors.map((error) => error.formattedMessage));
    return;
  }

  console.log(
    `The next newsletter will contain ${newGames.length} games out of ${games.length} and ${newPosts.length} posts out of ${posts.length}.`
  );
  res.status(200).end(html);
};
