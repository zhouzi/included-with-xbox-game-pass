import Fuse from "fuse.js";
import { browser } from "webextension-polyfill-ts";
import { APIGame } from "@included-with-xbox-game-pass/types";

(async () => {
  const API_ENDPOINT =
    process.env.NODE_ENV === "production"
      ? "https://gabinaureche.com/included-with-xbox-game-pass/"
      : "http://localhost:1234/";
  const { lastUpdatedTimestamp } = (await browser.storage.local.get({
    lastUpdatedTimestamp: null,
  })) as { lastUpdatedTimestamp: number | null };
  const lastUpdated = lastUpdatedTimestamp
    ? new Date(lastUpdatedTimestamp)
    : null;

  // 24 hours
  const EXPIRATION_DELAY = 86400000;
  const now = Date.now();
  if (lastUpdated == null || now - lastUpdated.getTime() > EXPIRATION_DELAY) {
    const res = await fetch(new URL("./games.json", API_ENDPOINT).href);

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

  const matches = fuse.search(
    (window.document.querySelector(".apphub_AppName") as HTMLElement)
      .textContent!
  );
  const bestMatch = matches[0]?.score! < 0.4 ? matches[0].item : null;

  const container = window.document.createElement("div");
  container.className = "dev_row";
  container.innerHTML = `<div class="subtitle column">Xbox Game Pass:</div><div class="summary column">${
    bestMatch
      ? `<a href="${bestMatch.url}" target="_blank">Included</a>`
      : "<span>Not Included</span>"
  }</div>`;

  window.document.querySelector(".user_reviews")!.appendChild(container);
})();
