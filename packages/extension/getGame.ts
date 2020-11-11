import Fuse from "fuse.js";
import { Game } from "../types";
import getGames from "./getGames";

export default async function getGame(name: string): Promise<Game | null> {
  const games = await getGames();
  const fuse = new Fuse(
    games.filter((game) => game.availability.pc),
    {
      keys: ["name"],
      includeScore: true,
      shouldSort: true,
    }
  );
  const matches = fuse.search(name).filter(
    (match) =>
      match.score! <= 0.1 ||
      // There's currently a bug with fuse.js for exact matches
      // https://github.com/krisk/Fuse/issues/481
      match.item.name.toLowerCase() === name.toLowerCase()
  );

  return matches[0]?.item;
}
