import path from "path";
import puppeteer from "puppeteer";
import random from "random-int";
import alphaSort from "alpha-sort";
import fse from "fs-extra";
import { Game } from "@xgp/types";
import currentGames from "../xgp.community/public/api/games.json";

const OUTPUT_DIR = path.join(__dirname, "..", "xgp.community", "public", "api");
const DEPRECATED_OUTPUT_DIR = path.join(__dirname, "..", "gh-pages");
const XBOX_GAME_PASS_URL = "https://www.xbox.com/en-US/xbox-game-pass/games";

(async function scrapGames() {
  const addedAt = new Date().toISOString();
  const games: Game[] = [];

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const expectations: { totalGames: number } = {
    totalGames: 0,
  };

  await page.goto(XBOX_GAME_PASS_URL);
  await (async function scrapCurrentPageAndGoNext(): Promise<void> {
    await page.waitForSelector(
      `.gameList [itemtype="http://schema.org/Product"]`
    );

    const totalGames = await page.$eval(".resultsText", (element) =>
      Number(element.textContent!.match(/([0-9]+) result/)![1])
    );
    if (totalGames > expectations.totalGames) {
      expectations.totalGames = totalGames;
    }

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
              addedAt,
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

  await browser.close();

  if (expectations.totalGames <= 0) {
    throw new Error(
      `Scrapping ended with an expected number of games of ${expectations.totalGames}.`
    );
  }

  if (games.length < expectations.totalGames) {
    throw new Error(
      `Scrapping ended with ${games.length} games instead of ${expectations.totalGames}.`
    );
  }

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
        game.addedAt = currentGame.addedAt;
      }
    });

  await fse.writeJSON(path.join(OUTPUT_DIR, "games.json"), games, {
    spaces: 2,
  });
  await fse.copyFile(
    path.join(OUTPUT_DIR, "games.json"),
    path.join(DEPRECATED_OUTPUT_DIR, "games.json")
  );
})();
