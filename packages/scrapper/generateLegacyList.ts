import fse from "fs-extra";
import path from "path";
import games from "../website/static/api/v1/games.json";

(async () => {
  await fse.writeJSON(
    path.join(__dirname, "..", "website", "static", "games.json"),
    games.map((game) => ({
      slug: game.slug,
      name: game.name,
      availability: {
        console: null,
        pc: game.xboxUrl,
        steam: game.steamId
          ? `https://store.steampowered.com/app/${game.steamId}/`
          : null,
      },
      steam: game.steamId,
      updatedAt: "2021-01-01T00:00:00.000Z",
    })),
    { spaces: 2 }
  );
})();
