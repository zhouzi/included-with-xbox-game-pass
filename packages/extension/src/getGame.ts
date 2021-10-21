import { Game } from "@included-with-xbox-game-pass/types";
import getGames from "./getGames";

export default async function getGame(url: string): Promise<Game | null> {
  const games = await getGames();
  const game = games.find((game) =>
    game.steamIds.some((steamId) =>
      url.startsWith(`https://store.steampowered.com/app/${steamId}/`)
    )
  );

  return game ?? null;
}
