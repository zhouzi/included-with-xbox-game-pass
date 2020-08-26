import Fuse from "fuse.js";
import getGames from "./getGames";
import badge from "./features/badge";

(async () => {
  const games = await getGames();
  const fuse = new Fuse(games, {
    keys: ["name"],
    includeScore: true,
    shouldSort: true,
  });
  const matches = fuse.search(
    window.document.querySelector(".apphub_AppName")?.textContent ?? ""
  );
  const bestMatch = matches[0]?.score! < 0.4 ? matches[0].item : null;

  badge(bestMatch);
})();
