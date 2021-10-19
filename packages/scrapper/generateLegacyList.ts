import fse from "fs-extra";
import path from "path";
import games from "../website/static/api/v1/games.json";

(async () => {
  await fse.writeJSON(
    path.join(__dirname, "..", "website", "static", "games.json"),
    games.map((game) => {
      const steamId =
        game.steamIds.length > 0
          ? game.steamIds[game.steamIds.length - 1]
          : null;

      return {
        slug: game.slug,
        name: game.name,
        availability: {
          console: null,
          pc: game.xboxUrl,
          steam: steamId
            ? `https://store.steampowered.com/app/${steamId}/`
            : null,
        },
        steam: steamId,
        updatedAt: "2021-01-01T00:00:00.000Z",
      };
    }),
    { spaces: 2 }
  );
})();
