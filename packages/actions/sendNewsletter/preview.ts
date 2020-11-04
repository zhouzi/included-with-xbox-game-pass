import http from "http";

import games from "../../xgp.community/api/v1/games.json";
import news from "../../xgp.community/api/v1/news.json";
import { getTemplateParams, generateHTML } from "./generateHTML";

const server = http.createServer(async (req, res) => {
  const templateParams = await getTemplateParams({
    games: games.slice(0, 5),
    news: news.slice(0, 4),
  });
  const html = await generateHTML(templateParams);

  res.write(html);
  res.end();
});

server.listen(3000);
