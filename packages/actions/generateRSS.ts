import path from "path";
import fse from "fs-extra";
import RSS from "rss";

import games from "../xgp.community/api/v1/games.json";
import news from "../xgp.community/api/v1/news.json";

const OUTPUT_DIR = path.join(__dirname, "..", "xgp.community", "api", "v1");

// wasn't able to use rss' types definition
interface ItemOptions {
  title: string;
  description: string;
  url: string;
  date: Date;
}

const feedItems: ItemOptions[] = games
  .map((game) => ({
    title: `${game.name} (${[
      game.availability.pc && "PC",
      game.availability.console && "Console",
    ]
      .filter(Boolean)
      .join(", ")})`,
    description: "",
    url: game.url,
    date: new Date(game.addedAt),
  }))
  .concat(
    news.map((newsItem) => ({
      title: newsItem.title,
      description: "",
      url: newsItem.url,
      date: new Date(newsItem.publishedAt),
    }))
  )
  .sort((a, b) => b.date.getTime() - a.date.getTime());

const feed = new RSS({
  title: "xgp.community",
  feed_url: "https://xgp.community/api/v1/rss.xml",
  site_url: "https://xgp.community",
});

feedItems.forEach((feedItem) => {
  feed.item(feedItem);
});

(async () => {
  await fse.writeFile(path.join(OUTPUT_DIR, "rss.xml"), feed.xml());
})();
