import storageCache from "webext-storage-cache";
import { Game } from "@included-with-xbox-game-pass/types";

const API_HOST =
  process.env.NODE_ENV === "production"
    ? "https://included-with-xbox-game-pass.gabin.app/api/v1"
    : "http://localhost:1234/";
const API_ENDPOINT = new URL("./games.json", API_HOST).href;

export default storageCache.function<Game[], () => Promise<Game[]>, never>(
  async () => {
    const res = await fetch(API_ENDPOINT);
    const json: Game[] = await res.json();

    return json;
  },
  {
    maxAge: {
      days: 1,
    },
    cacheKey: () => API_HOST,
  }
);
