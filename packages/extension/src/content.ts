import Fuse from "fuse.js";
import { APIGame } from "@included-in-xbox-game-pass/types";

(async () => {
  const res = await fetch("http://localhost:1234/games.json");
  const games: APIGame[] = await res.json();
  const fuse = new Fuse(games, {
    keys: ["name"],
    includeScore: true,
    shouldSort: true,
  });

  const matches = fuse.search(
    (window.document.querySelector(".apphub_AppName") as HTMLElement)
      .textContent
  );
  const bestMatch = matches[0]?.score < 0.4 ? matches[0].item : null;

  const container = window.document.createElement("div");
  container.className = "dev_row";
  container.innerHTML = `<div class="subtitle column">Xbox Game Pass:</div><div class="summary column">${
    bestMatch
      ? `<a href="${bestMatch.url}" target="_blank">Included</a>`
      : "<span>Not Included</span>"
  }</div>`;

  window.document.querySelector(".user_reviews").appendChild(container);
})();
