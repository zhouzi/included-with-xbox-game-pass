import Fuse from "fuse.js";
import { APIGame } from "@included-with-xbox-game-pass/types";
import getGames from "./getGames";

export default async function getGame(name: string): Promise<APIGame | null> {
  const games = await getGames();
  const fuse = new Fuse(games, {
    keys: ["name"],
    includeScore: true,
    shouldSort: true,
  });
  const matches = fuse
    .search(name)
    .filter(
      (match) =>
        // APIGame.availability was introduced recently,
        // it might be missing from some users' cache
        match.item.availability?.pc !== false
    )
    .filter((match) => match.score! < 0.4);

  return matches[0]?.item;
}
