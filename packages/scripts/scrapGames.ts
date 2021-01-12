import path from "path";
import fse from "fs-extra";
import puppeteer from "puppeteer";
import alphaSort from "alpha-sort";
import random from "random-int";
import { Game } from "@xgp/types";

import currentGames from "../xgp.community/static/games.json";

const OUTPUT_DIR = path.join(__dirname, "..", "xgp.community", "static");

(async function scrapGames() {
  const addedAt = new Date().toISOString();
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const games: Game[] = [];

  await page.goto("https://www.xbox.com/en-US/xbox-game-pass/games");

  await (async function scrapCurrentPageAndGoNext(): Promise<void> {
    await page.waitForSelector(
      `.gameList [itemtype="http://schema.org/Product"]`
    );

    games.push(
      ...(await page.$$eval(
        `.gameList [itemtype="http://schema.org/Product"]`,
        (elements, addedAt) =>
          elements.map(
            (element): Game => ({
              id: element.getAttribute("data-bigid")!,
              name: element.querySelector("h3")!.textContent!,
              url: element.querySelector("a")!.href,
              image: element.querySelector("img")!.getAttribute("src")!,
              availability: {
                console: Boolean(
                  element.querySelector(`[aria-label="Console"]`)
                ),
                pc: Boolean(element.querySelector(`[aria-label="PC"]`)),
              },
              releaseDate: element.getAttribute("data-releasedate")!,
              addedAt: addedAt,
            })
          ),
        addedAt
      ))
    );

    try {
      await page.waitForTimeout(random(500, 2000));
      await page.click(".paginatenext:not(.pag-disabled) a");
      return scrapCurrentPageAndGoNext();
    } catch (err) {}
  })();

  browser.close();

  games
    .sort(
      (a, b) =>
        alphaSort.caseInsensitiveAscending(a.name, b.name) ||
        alphaSort.caseInsensitiveAscending(a.id, b.id)
    )
    .forEach((game) => {
      const currentGame = currentGames.find(
        (otherGame) => otherGame.id === game.id
      );

      if (currentGame) {
        // do not update the addedAt date if the game was already included
        game.addedAt = currentGame.addedAt;
      }
    });

  await fse.writeJSON(path.join(OUTPUT_DIR, "games.json"), games, {
    spaces: 2,
  });
})();
