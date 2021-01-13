import path from "path";
import fse from "fs-extra";
import puppeteer from "puppeteer";
import alphaSort from "alpha-sort";
import random from "random-int";
import escapeRegexp from "escape-string-regexp";
import slugify from "@sindresorhus/slugify";
import { Game } from "@xgp/types";

import currentGames from "../xgp.community/static/games.json";

interface ScrappedGame {
  id: string;
  name: string;
  url: string;
  image: string;
  availability: {
    console: boolean;
    pc: boolean;
  };
  releaseDate: string;
}

const OUTPUT_DIR = path.join(__dirname, "..", "xgp.community", "static");

(async function scrapGames() {
  const updatedAt = new Date().toISOString();
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const games: Record<string, Game> = {};

  await page.goto("https://www.xbox.com/en-US/xbox-game-pass/games");

  await (async function scrapCurrentPageAndGoNext(): Promise<void> {
    await page.waitForSelector(
      `.gameList [itemtype="http://schema.org/Product"]`
    );

    const rawGames = await page.$$eval(
      `.gameList [itemtype="http://schema.org/Product"]`,
      (elements) =>
        elements.map(
          (element): ScrappedGame => ({
            id: element.getAttribute("data-bigid")!,
            name: element.querySelector("h3")!.textContent!,
            url: element.querySelector("a")!.href,
            image: element.querySelector("img")!.getAttribute("src")!,
            availability: {
              console: Boolean(element.querySelector(`[aria-label="Console"]`)),
              pc: Boolean(element.querySelector(`[aria-label="PC"]`)),
            },
            releaseDate: element.getAttribute("data-releasedate")!,
          })
        )
    );

    rawGames.forEach((rawGame) => {
      const name = cleanName(rawGame.name);
      const slug = slugify(name, {
        decamelize: false,
      });

      if (games[slug] == null) {
        games[slug] = {
          slug,
          name,
          url: rawGame.url,
          image: rawGame.image,
          availability: {
            console: null,
            pc: null,
          },
          updatedAt:
            currentGames.find((game) => game.slug === slug)?.updatedAt ??
            updatedAt,
        };
      }

      (Object.entries(rawGame.availability) as Array<
        [keyof typeof rawGame.availability, boolean]
      >).forEach(([platform, isAvailable]) => {
        if (isAvailable) {
          games[slug].availability[platform] = rawGame.url;
        }
      });
    });

    try {
      await page.waitForTimeout(random(500, 2000));
      await page.click(".paginatenext:not(.pag-disabled) a");
      return scrapCurrentPageAndGoNext();
    } catch (err) {}
  })();

  browser.close();

  await fse.writeJSON(
    path.join(OUTPUT_DIR, "games.json"),
    Object.values(games).sort((a, b) =>
      alphaSort.caseInsensitiveAscending(a.name, b.name)
    ),
    {
      spaces: 2,
    }
  );
})();

function cleanName(name: string): string {
  // games tend to add a suffix to their name on the Microsoft store
  // which makes it harder to match them with the actual game
  // below is a list of known suffixes that should be removed
  const suffixes = [
    "Windows",
    "Windows 10",
    "Windows 10 Edition",
    "Xbox One Edition",
    "(PC)",
    "PC",
    "Microsoft Store Edition",
    "WINDOWS EDITION",
    "Console Edition",
    "XB1",
    "Win10",
    "(Xbox One)",
  ].map((suffix) => new RegExp(`[-:\\s]*${escapeRegexp(suffix)}$`, "i"));
  return suffixes.reduce((acc, regexp) => acc.replace(regexp, ""), name).trim();
}
