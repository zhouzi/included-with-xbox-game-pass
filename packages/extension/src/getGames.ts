import storageCache from "webext-storage-cache";
import { APIGame } from "@included-with-xbox-game-pass/types";

const API_HOST =
  process.env.NODE_ENV === "production"
    ? "https://gabinaureche.com/included-with-xbox-game-pass/"
    : "http://localhost:1234/";
const API_ENDPOINT = new URL("./games.json", API_HOST).href;

export default storageCache.function<
  APIGame[],
  () => Promise<APIGame[]>,
  never
>(
  async () => {
    const res = await fetch(API_ENDPOINT);
    const json = await res.json();

    return json;
  },
  {
    maxAge: {
      days: 1,
    },
    cacheKey: () => "games",
  }
);
