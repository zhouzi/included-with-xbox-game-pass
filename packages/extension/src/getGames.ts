import storageCache from "webext-storage-cache";
import { APIGame } from "@included-with-xbox-game-pass/types";

const API_HOST =
  process.env.NODE_ENV === "production"
    ? "https://gabinaureche.com/included-with-xbox-game-pass/"
    : "http://localhost:1234/";
const API_ENDPOINT = new URL("./games.json", API_HOST).href;

// The response's API is cached so the cache might fall out of date at some point.
// By copying APIGame, we are making sure Typescript will throw an error if we were
// to use something that is available in the API but not in the cache.
// When that happens, the idea is to update both CachedAPIGame and shouldRevalidate
interface CachedAPIGame {
  id: string;
  name: string;
  url: string;
  image: string;
  availability: {
    console: boolean;
    pc: boolean;
  };
  releaseDate: string;
  addedAt: string;
}

export default storageCache.function<
  CachedAPIGame[],
  () => Promise<CachedAPIGame[]>,
  never
>(
  async () => {
    const res = await fetch(API_ENDPOINT);
    const json: APIGame[] = await res.json();

    return json;
  },
  {
    maxAge: {
      days: 1,
    },
    cacheKey: () => "games",
    shouldRevalidate: (games) => games.some((game) => game.addedAt == null),
  }
);
