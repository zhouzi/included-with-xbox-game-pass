import path from "path";
import fse from "fs-extra";
import games from "../xgp.community/api/v1/games.json";
import { APIGame } from "../types";
import { getMicrosoftAnnouncements } from "./getMicrosoftAnnouncements";

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

  console.log(
    JSON.stringify(
      {
        recentGames: recentGames.map(formatGameToParams),
        releasedSoonGames: releasedSoonGames.map(formatGameToParams),
        microsoftAnnouncements,
      },
      null,
      2
    )
  );

  await fse.writeFile(lastAggregatedAtPath, aggregatedAt.toISOString());
})();

function formatGameToParams(
  game: APIGame
): { url: string; name: string; availability: string } {
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
