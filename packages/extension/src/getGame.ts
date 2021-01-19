import getGames, { CachedGame } from "./getGames";

export default async function getGame(url: string): Promise<CachedGame | null> {
  const games = await getGames();
  const game = games.find(
    (game) =>
      game.availability.pc &&
      game.steam &&
      url.startsWith(`https://store.steampowered.com/app/${game.steam.appid}/`)
  );

  return game ?? null;
}
