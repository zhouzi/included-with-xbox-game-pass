import { browser } from "webextension-polyfill-ts";
import Fuse from "fuse.js";
import { APIGame } from "@included-with-xbox-game-pass/types";

const API_HOST =
  process.env.NODE_ENV === "production"
    ? "https://gabinaureche.com/included-with-xbox-game-pass/"
    : "http://localhost:1234/";
const API_ENDPOINT = new URL("./games.json", API_HOST).href;

// 24 hours
const CACHE_EXPIRATION_DELAY = 86400000;

export async function getXGPGame(name: string): Promise<APIGame | null> {
  const { lastUpdatedTimestamp } = (await browser.storage.local.get({
    lastUpdatedTimestamp: null,
  })) as { lastUpdatedTimestamp: number | null };
  const lastUpdated = lastUpdatedTimestamp
    ? new Date(lastUpdatedTimestamp)
    : null;

  const now = Date.now();
  if (
    lastUpdated == null ||
    now - lastUpdated.getTime() > CACHE_EXPIRATION_DELAY
  ) {
    const res = await fetch(API_ENDPOINT);

    await browser.storage.local.set({
      lastUpdatedTimestamp: now,
      games: await res.json(),
    });
  }

  const { games } = (await browser.storage.local.get({
    games: [],
  })) as { games: APIGame[] };

  const fuse = new Fuse(games, {
    keys: ["name"],
    includeScore: true,
    shouldSort: true,
  });
  const matches = fuse.search(name);
  const bestMatch = matches[0]?.score! < 0.4 ? matches[0].item : null;

  return bestMatch;
}
