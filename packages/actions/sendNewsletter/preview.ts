import http from "http";

import games from "../../xgp.community/api/v1/games.json";
import posts from "../../xgp.community/api/v1/posts.json";
import { getTemplateParams, generateHTML } from "./generateHTML";

const server = http.createServer(async (req, res) => {
  const templateParams = await getTemplateParams({
    games: games.slice(0, 5),
    posts: posts.slice(0, 4),
  });
  const html = await generateHTML(templateParams);

  res.write(html);
  res.end();
});

server.listen(3000);
