import getGames, { CachedGame } from "./getGames";

export default async function getGame(url: string): Promise<CachedGame | null> {
  const games = await getGames();
  const game = games.find(
    (game) =>
      game.availability.pc &&
      game.availability.steam &&
      url.startsWith(game.availability.steam)
  );

  return game ?? null;
}
